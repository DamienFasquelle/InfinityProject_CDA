import React, { useEffect, useState, useContext } from 'react';
import {
  Row,
  Col,
  Button,
  Form,
  Spinner,
  Alert,
  Modal,
} from 'react-bootstrap';
import { FaPlusCircle, FaImage } from 'react-icons/fa';
import { AuthContext } from '../../providers/AuthProvider';
import { fetchAllTopics, createTopic, fetchGenres } from '../../services/forumService';
import TopicCard from '../../components/TopicCard';

const Forum = () => {
  const { isAuthenticated } = useContext(AuthContext);

  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [errorTopics, setErrorTopics] = useState(null);

  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [errorGenres, setErrorGenres] = useState(null);

  const [showModal, setShowModal] = useState(false);

  // Form states
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [newTopicImage, setNewTopicImage] = useState(null);
  const [newTopicGenre, setNewTopicGenre] = useState(''); // genre id selected

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // URL de base backend (adapter selon ton environnement)
  const baseUrl = process.env.REACT_APP_API_URL;

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

    

    const loadGenres = async () => {
      try {
        const data = await fetchGenres();
        setGenres(data);
      } catch {
        setErrorGenres('Impossible de charger les genres.');
      } finally {
        setLoadingGenres(false);
      }
    };

    loadTopics();
    loadGenres();
  }, []);

  const openModal = () => {
    setSubmitError(null);
    setSubmitSuccess(null);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setNewTopicTitle('');
    setNewTopicDescription('');
    setNewTopicImage(null);
    setNewTopicGenre('');
    setSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!newTopicTitle.trim() || !newTopicDescription.trim() || !newTopicGenre) {
      setSubmitError('Titre, description et genre sont obligatoires.');
      return;
    }

    setSubmitting(true);

    try {
      await createTopic({
        title: newTopicTitle.trim(),
        description: newTopicDescription.trim(),
        genre: newTopicGenre,
        image: newTopicImage,
      });

      setSubmitSuccess('Topic créé avec succès !');

      const refreshed = await fetchAllTopics();
      setTopics(refreshed);

      closeModal();
    } catch (err) {
      setSubmitError(err.message || 'Erreur lors de la création du topic.');
    } finally {
      setSubmitting(false);
    }
  };

  const topicsByGenre = genres.reduce((acc, genre) => {
    acc[genre.id] = {
      genre,
      topics: topics.filter((t) => t.genre && t.genre.id === genre.id),
    };
    return acc;
  }, {});

  return (
    <main className="container my-4">
      <section className="text-center mb-4">
        <h1 className="fw-bold">Forum Infinity Games</h1>
        <p className="text-white">
          Partagez vos idées, posez vos questions ou discutez autour de vos jeux préférés.
        </p>

        {isAuthenticated && (
          <Button
            variant="primary"
            onClick={openModal}
            className="d-flex align-items-center mx-auto"
          >
            <FaPlusCircle className="me-2" /> Créer un topic
          </Button>
        )}
        {!isAuthenticated && (
          <Alert variant="info" className="mt-3">
            Vous devez être connecté pour créer un nouveau topic.
          </Alert>
        )}
      </section>

      <Row>
        <Col lg={8} className="mx-auto">
          {(loadingTopics || loadingGenres) && (
            <div className="text-center my-4">
              <Spinner animation="border" variant="primary" />
            </div>
          )}

          {(errorTopics || errorGenres) && (
            <>
              {errorTopics && <Alert variant="danger">{errorTopics}</Alert>}
              {errorGenres && <Alert variant="danger">{errorGenres}</Alert>}
            </>
          )}

          {!loadingTopics && !loadingGenres && genres.length === 0 && (
            <p className="text-muted text-center">Aucun genre disponible.</p>
          )}

          {!loadingTopics && !loadingGenres && genres.length > 0 && (
            <>
              {genres.map((genre) => (
                <div key={genre.id} className="mb-4">
                  <h3 className="text-light mb-3 border-bottom pb-2">{genre.name}</h3>
                  {topicsByGenre[genre.id]?.topics.length > 0 ? (
                    topicsByGenre[genre.id].topics.map((topic) => (
                 <TopicCard key={topic.id} topic={topic} baseUrl={baseUrl} />
                    ))
                  ) : (
                    <p className="text-muted">Aucun topic pour ce genre.</p>
                  )}
                </div>
              ))}
            </>
          )}
        </Col>
      </Row>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-dark fw-bold">Créer un nouveau topic</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitError && <Alert variant="danger">{submitError}</Alert>}
          {submitSuccess && <Alert variant="success">{submitSuccess}</Alert>}

          <Form onSubmit={handleSubmit} encType="multipart/form-data">
            <Form.Group className="mb-3">
              <Form.Label className="text-dark">Titre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Titre du topic"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                disabled={submitting}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-dark">Genre</Form.Label>
              <Form.Select
                value={newTopicGenre}
                onChange={(e) => setNewTopicGenre(e.target.value)}
                disabled={submitting || loadingGenres}
                required
              >
                <option value="">Sélectionnez un genre</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-dark">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Décrivez votre sujet"
                value={newTopicDescription}
                onChange={(e) => setNewTopicDescription(e.target.value)}
                disabled={submitting}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-dark">
                <FaImage className="me-1" />
                Image (optionnelle)
              </Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setNewTopicImage(e.target.files[0])}
                disabled={submitting}
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Publication...
                  </>
                ) : (
                  'Créer le topic'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </main>
  );
};

export default Forum;
