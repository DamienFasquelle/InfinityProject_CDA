import React, { useEffect, useState, useContext } from 'react';
import {
  Row,
  Col,
  Button,
  Form,
  Spinner,
  Alert,
  Card,
} from 'react-bootstrap';
import { AuthContext } from '../providers/AuthProvider';
import { fetchAllTopics, createTopic } from '../services/forumService';

const Forum = () => {
  const { isAuthenticated } = useContext(AuthContext);

  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [errorTopics, setErrorTopics] = useState(null);

  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Charger les topics au montage
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const data = await fetchAllTopics();
        setTopics(data);
      } catch {
        setErrorTopics('Impossible de charger les topics.');
      } finally {
        setLoadingTopics(false);
      }
    };
    loadTopics();
  }, []);

  // Création d'un topic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!newTopicTitle.trim()) {
      setSubmitError('Le titre est obligatoire.');
      return;
    }

    setSubmitting(true);
    try {
      await createTopic({ title: newTopicTitle.trim() });
      setSubmitSuccess('Topic créé avec succès !');
      setNewTopicTitle('');

      const refreshed = await fetchAllTopics();
      setTopics(refreshed);
    } catch (err) {
      setSubmitError(err.message || 'Erreur lors de la création du topic.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container">
      <section className="intro text-center my-2">
        <h1>
          Forum Infinity Games
        </h1>
        <p>
          Bienvenue sur le forum communautaire d’Infinity Games ! Partagez vos
          idées, posez vos questions ou discutez autour de vos jeux préférés.
        </p>
      </section>

     
      <Row>
        <Col>
          <section>
            <h2 className="mb-4">Tous les topics</h2>

            {loadingTopics && (
              <div className="text-center">
                <Spinner animation="border" variant="primary" />
              </div>
            )}

            {errorTopics && <Alert variant="danger">{errorTopics}</Alert>}

            {!loadingTopics && !errorTopics && topics.length === 0 && (
              <p style={{ color: 'var(--text-muted)' }}>
                Aucun topic pour le moment.
              </p>
            )}

            {!loadingTopics &&
              topics.length > 0 &&
              topics.map((topic) => (
                <Card
                  key={topic.id}
                  className="mb-3 shadow-sm topic-card"
                  bg="dark"
                  text="light"
                  onClick={() =>
                    (window.location.href = `/forum/topic/${topic.id}`)
                  }
                  style={{ cursor: 'pointer' }}
                  aria-label={`Voir le topic ${topic.title}`}
                >
                  <Card.Body>
                    <Card.Title>
                      {topic.title}
                    </Card.Title>
                    <Card.Subtitle className="text-white-50 mb-2">
                      Par {topic.user.username} •{' '}
                      {new Date(topic.createdAt).toLocaleDateString()}
                    </Card.Subtitle>
                  </Card.Body>
                </Card>
              ))}
          </section>

          {/* Formulaire de création */}
          <section className="mt-5">
            {isAuthenticated ? (
              <>
                <h3 className="mb-3">Créer un nouveau topic</h3>

                {submitError && <Alert variant="danger">{submitError}</Alert>}
                {submitSuccess && (
                  <Alert variant="success">{submitSuccess}</Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="topicTitle">
                    <Form.Label>Titre du topic</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Titre de votre discussion"
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      disabled={submitting}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="btn-gradient"
                  >
                    {submitting ? 'Publication en cours...' : 'Créer le topic'}
                  </Button>
                </Form>
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>
                Vous devez être connecté pour créer un nouveau topic.
              </p>
            )}
          </section>
        </Col>
      </Row>
    </main>
  );
};

export default Forum;
