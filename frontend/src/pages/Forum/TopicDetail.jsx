import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Spinner, Image } from 'react-bootstrap';
import { AuthContext } from '../../providers/AuthProvider';
import { FaComments, FaUserCircle, FaCalendarAlt, FaPaperPlane } from 'react-icons/fa';
import Avatar from '../../components/Avatar';
import { fetchTopicById } from '../../services/forumService';

const API_URL = process.env.REACT_APP_API_URL;


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
  const fetch = async () => {
    try {
      const data = await fetchTopicById(id);
      setTopic(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetch();
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
    <div className="topic-detail-container" style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <header style={{ marginBottom: 30 }}>
        <h2 style={{ fontWeight: '700' }}>{topic.title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15, color: '#6c757d', fontSize: 14 }}>
          <FaUserCircle />
          <span>Créé par <strong>{topic.user?.username || 'Utilisateur inconnu'}</strong></span>
          <FaCalendarAlt />
          <time dateTime={topic.createdAt}>
            {new Date(topic.createdAt).toLocaleString()}
          </time>
        </div>
        {topic.image && (
          <Image
            src={`${API_URL}${topic.image}`}
            alt={`Image du topic ${topic.title}`}
            fluid
            rounded
            style={{ marginTop: 20, maxHeight: 300, objectFit: 'cover', width: '100%' }}
          />
        )}
        {topic.description && (
          <p style={{ marginTop: 20, fontSize: '1.1rem', lineHeight: 1.5, color: '#f8f9fa' }}>
            {topic.description}
          </p>
        )}
        <hr style={{ marginTop: 40, marginBottom: 30, borderColor: '#444' }} />
      </header>

      <section>
        <h4 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FaComments /> Messages ({topic.messages?.length || 0})
        </h4>

        {(!topic.messages || topic.messages.length === 0) && (
          <p style={{ fontStyle: 'italic', color: '#adb5bd' }}>Aucun message pour le moment.</p>
        )}

        <div className="messages-list" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {topic.messages?.map((msg) => {
            const username = msg.user?.username || 'Utilisateur inconnu';
            const photo = msg.user?.photo
              ? `${API_URL}/uploads/user_photos/${msg.user.photo}`
              : null;

            return (
              <div
                key={msg.id}
                className="message-card"
                style={{
                  display: 'flex',
                  gap: 15,
                  backgroundColor: '#212529',
                  padding: 15,
                  borderRadius: 10,
                  alignItems: 'flex-start',
                }}
              >
                <Avatar username={username} photo={photo} size={50} />
                <div className="message-content" style={{ flex: 1 }}>
                  <div
                    className="message-header"
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: '#adb5bd' }}
                  >
                    <span className="username" style={{ fontWeight: '600', color: '#f8f9fa' }}>{username}</span>
                    <time dateTime={msg.createdAt}>{new Date(msg.createdAt).toLocaleString()}</time>
                  </div>
                  <div className="message-text" style={{ fontSize: 16, whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ marginTop: 40 }}>
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {submitError && (
              <Alert variant="danger" className="mb-2">
                {submitError}
              </Alert>
            )}

            <label htmlFor="newMessage" style={{ fontWeight: '600', color: '#f8f9fa' }}>
              <FaPaperPlane className="me-1" /> Répondre au topic
            </label>
            <textarea
              id="newMessage"
              rows={4}
              placeholder="Votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={submitting}
              style={{
                resize: 'vertical',
                padding: 10,
                fontSize: 16,
                borderRadius: 8,
                border: '1px solid #495057',
                backgroundColor: '#343a40',
                color: '#f8f9fa',
              }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                alignSelf: 'flex-end',
                backgroundColor: '#0d6efd',
                color: 'white',
                border: 'none',
                padding: '10px 25px',
                borderRadius: 8,
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#084cd6')}
              onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#0d6efd')}
            >
              {submitting ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </form>
        ) : (
          <p style={{ color: '#adb5bd', fontStyle: 'italic' }}>
            Vous devez être connecté pour répondre.
          </p>
        )}
      </section>
    </div>
  );
};

export default TopicDetail;
