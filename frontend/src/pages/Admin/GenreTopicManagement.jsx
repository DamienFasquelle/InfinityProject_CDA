import React, { useEffect, useState } from "react";
import {
  Card,
  ListGroup,
  Spinner,
  Alert,
  Button,
  Modal,
  Form,
} from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("token");

const useGenres = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGenres = async () => {
    if (!token) {
      setError("Utilisateur non connecté.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/genres/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des genres.");
      const data = await res.json();
      setGenres(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  return { genres, loading, error, fetchGenres };
};

const GenreModal = ({ show, mode, genre, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    if (mode === "edit" && genre) {
      setFormData({ name: genre.name, description: genre.description || "" });
    } else {
      setFormData({ name: "", description: "" });
    }
  }, [mode, genre]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title className="text-dark fw-bold">{mode === "create" ? "Créer un genre" : "Modifier le genre"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group controlId="genreName" className="mb-3">
            <Form.Label className="text-dark fw-bold">Nom</Form.Label>
            <Form.Control
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nom du genre"
            />
          </Form.Group>
          <Form.Group controlId="genreDescription">
            <Form.Label className="text-dark fw-bold">Description</Form.Label>
            <Form.Control
              name="description"
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Description (optionnelle)"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary">
            {mode === "create" ? "Créer" : "Enregistrer"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const GenreTopicManagement = () => {
  const { genres, loading, error, fetchGenres } = useGenres();

  const [modalInfo, setModalInfo] = useState({
    show: false,
    mode: "create",
    genre: null,
  });
  const [errorMessage, setErrorMessage] = useState(null);

  const openCreateModal = () => setModalInfo({ show: true, mode: "create", genre: null });
  const openEditModal = (genre) => setModalInfo({ show: true, mode: "edit", genre });

  const closeModal = () => setModalInfo((info) => ({ ...info, show: false }));

  const handleSave = async (data) => {
    const { mode, genre } = modalInfo;
    const url =
      mode === "create"
        ? `${API_URL}/api/topic-genre/create`
        : `${API_URL}/api/topic-genre/${genre.id}/edit`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur inconnue");
      }
      closeModal();
      fetchGenres();
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce genre ?")) return;

    try {
      const res = await fetch(`${API_URL}/api/topic-genre/${id}/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression.");
      fetchGenres();
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-3">
        <Spinner animation="border" variant="info" />
        <p>Chargement des genres...</p>
      </div>
    );
  }

  return (
    <Card.Body style={{ maxHeight: 500, overflowY: "auto"}}>
      {error && <Alert variant="danger">{error}</Alert>}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="text-white">Gestion des Genres({genres.length})</h5>
        <Button variant="success" size="sm" onClick={openCreateModal}>
          + Ajouter un genre
        </Button>
      </div>

      {genres.length === 0 ? (
        <p>Aucun genre trouvé.</p>
      ) : (
        <ListGroup>
          {genres.map(({ id, name, description }) => (
            <ListGroup.Item key={id} className="d-flex justify-content-between bg-dark text-white align-items-center">
              <div>
                <strong>{name}</strong>
                <br />
                <small>{description}</small>
              </div>
              <div>
                <Button variant="primary" size="sm" className="me-2" onClick={() => openEditModal({ id, name, description })}>
                  Modifier
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(id)}>
                  Supprimer
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      <GenreModal
        show={modalInfo.show}
        mode={modalInfo.mode}
        genre={modalInfo.genre}
        onClose={closeModal}
        onSave={handleSave}
      />
    </Card.Body>
  );
};

export default GenreTopicManagement;
