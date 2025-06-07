import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Spinner, Image, Row, Col } from 'react-bootstrap';
import { AuthContext } from '../../providers/AuthProvider';
import { FaComments, FaPaperPlane } from 'react-icons/fa';
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

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="info" /></div>;
  if (error) return <Alert variant="danger" className="mt-4">{error}</Alert>;
  if (!topic) return <Alert variant="warning" className="mt-4">Topic introuvable.</Alert>;

  const topicAuthorPhoto = topic.user?.photo
    ? `${API_URL}/uploads/user_photos/${topic.user.photo}`
    : null;

  return (
    <div className="container mt-4 topic-detail fadeInUp">
      <Row>
        <Col md={4}>
          <div className="info-card mb-4">
            <h3 className="mb-3">{topic.title}</h3>
            <div className="d-flex align-items-center text-start gap-3 text-white mb-2">
              <Avatar username={topic.user?.username || 'Utilisateur inconnu'} photo={topicAuthorPhoto} size={40} />
              <div>
                <strong>{topic.user?.username || 'Utilisateur inconnu'}</strong><br />
                <small>
                  <time dateTime={topic.createdAt}>{new Date(topic.createdAt).toLocaleString()}</time>
                </small>
              </div>
            </div>

            {topic.image && (
              <Image
                src={`${API_URL}${topic.image}`}
                alt={`Image du topic ${topic.title}`}
                fluid
                rounded
                className="my-3"
                style={{ maxHeight: 250, objectFit: 'cover' }}
              />
            )}

            {topic.description && (
              <p className="card-text mt-3">{topic.description}</p>
            )}
          </div>
        </Col>

        <Col md={8}>
          <div className="info-card mb-4">
            <h4 className="d-flex align-items-center gap-2 mb-3">
              <FaComments /> Messages ({topic.messages?.length || 0})
            </h4>

            {(!topic.messages || topic.messages.length === 0) ? (
              <p className="fst-italic">Aucun message pour le moment.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {topic.messages.map((msg) => {
                  const username = msg.user?.username || 'Utilisateur inconnu';
                  const photo = msg.user?.photo
                    ? `${API_URL}/uploads/user_photos/${msg.user.photo}`
                    : null;

                  return (
                    <div key={msg.id} className="comment d-flex gap-3">
                      <Avatar username={username} photo={photo} size={50} />
                      <div>
                        <div className="d-flex justify-content-between text-white small mb-1">
                          <strong className="me-2">{username} le</strong>
                          <time dateTime={msg.createdAt}>{new Date(msg.createdAt).toLocaleString()}</time>
                        </div>
                        <div className="comment-content">{msg.content}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="add-comment-form">
            {isAuthenticated ? (
              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                {submitError && <Alert variant="danger">{submitError}</Alert>}
                <label htmlFor="newMessage" className="fw-bold">
                  <FaPaperPlane className="me-2" />Répondre au topic
                </label>
                <textarea
                  id="newMessage"
                  rows={4}
                  placeholder="Votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={submitting}
                />
                <button
                  type="submit"
                  className="btn-gradient align-self-end"
                  disabled={submitting}
                >
                  {submitting ? 'Envoi en cours...' : 'Envoyer'}
                </button>
              </form>
            ) : (
              <p className="fst-italic">Vous devez être connecté pour répondre.</p>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default TopicDetail;
