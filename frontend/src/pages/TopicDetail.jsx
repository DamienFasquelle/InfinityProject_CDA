import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../providers/AuthProvider';
import { FaComments, FaUserCircle, FaCalendarAlt, FaPaperPlane } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const avatarBgColors = [
  '#6c757d', '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6610f2'
];

function getAvatarColor(username) {
  if (!username) return avatarBgColors[0];
  const charCode = username.charCodeAt(0);
  return avatarBgColors[charCode % avatarBgColors.length];
}

const TopicDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useContext(AuthContext);

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchTopic = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/topic/${id}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Erreur lors du chargement du topic');
        }
        const data = await res.json();
        setTopic(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!newMessage.trim()) {
      setSubmitError('Le message ne peut pas être vide.');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/post/create/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors de l'envoi du message");
      }
      const messageSaved = await res.json();
      setTopic((prev) => ({
        ...prev,
        messages: [...(prev.messages || []), messageSaved],
      }));
      setNewMessage('');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <Spinner animation="border" />
      </div>
    );

  if (error)
    return (
      <div style={{ padding: 20 }}>
        <Alert variant="danger">{error}</Alert>
      </div>
    );

  if (!topic)
    return (
      <div style={{ padding: 20 }}>
        <Alert variant="warning">Topic introuvable.</Alert>
      </div>
    );

 return (
  <div className="topic-detail-container">
    <h2>{topic.title}</h2>
    <p className="topic-meta">
      Créé par <strong>{topic.user?.username || 'Utilisateur inconnu'}</strong> le{' '}
      {new Date(topic.createdAt).toLocaleString()}
    </p>

    <hr className="topic-divider" />

    <h4>Messages ({topic.messages?.length || 0})</h4>

    {(!topic.messages || topic.messages.length === 0) && (
      <p className="no-messages">Aucun message pour le moment.</p>
    )}

    <div className="messages-list">
      {topic.messages?.map((msg) => {
        const username = msg.user?.username || 'Utilisateur inconnu';
        const photo = msg.user?.photo
          ? `${API_URL}/uploads/user_photos/${msg.user.photo}`
          : null;

        const getInitials = (name) => {
          if (!name) return '';
          return name.slice(0, 2).toUpperCase();
        };

        return (
          <div key={msg.id} className="message-card">
            {photo ? (
              <div className="avatar">
                <img src={photo} alt={`${username} avatar`} />
              </div>
            ) : (
              <div className="avatar">{getInitials(username)}</div>
            )}

            <div className="message-content">
              <div className="message-header">
                <span className="username">{username}</span>
                <span className="date">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <div className="message-text">{msg.content}</div>
            </div>
          </div>
        );
      })}
    </div>

    {isAuthenticated ? (
      <form onSubmit={handleSubmit} className="reply-form">
        {submitError && <div className="submit-error">{submitError}</div>}

        <label htmlFor="newMessage">Répondre au topic</label>
        <textarea
          id="newMessage"
          rows={4}
          placeholder="Votre message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={submitting}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Envoi en cours...' : 'Envoyer'}
        </button>
      </form>
    ) : (
      <p className="not-authenticated-msg">Vous devez être connecté pour répondre.</p>
    )}
  </div>
);


};

export default TopicDetail;
