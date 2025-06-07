import React, { useEffect, useState } from "react";
import { Card, ListGroup, Spinner, Alert, Row, Col, Button, Modal } from "react-bootstrap";

const token = localStorage.getItem("token");

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pour modal confirmation
  const [showModal, setShowModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const API_URL = process.env.REACT_APP_API_URL;
    if (!token) {
      setError("Utilisateur non connecté.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/post/list-genre`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des posts.");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    const API_URL = process.env.REACT_APP_API_URL;
    if (!postToDelete) return;

    try {
      const res = await fetch(`${API_URL}/api/post/delete/${postToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la suppression");
      }
      // Supprime localement le post supprimé
      setPosts(posts.filter((p) => p.id !== postToDelete.id));
      setShowModal(false);
      setPostToDelete(null);
    } catch (err) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setPostToDelete(null);
  };

  if (loading) {
    return (
      <div className="text-center my-3 text-light">
        <Spinner animation="border" variant="light" />
        <p>Chargement des posts...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <>
      <Card
        bg="dark"
        text="light"
        style={{ padding: "10px", maxHeight: 500, overflowY: "auto" }}
      >
        <h5 className="mb-3">Posts ({posts.length})</h5>

        {posts.length === 0 ? (
          <p>Aucun post trouvé.</p>
        ) : (
          <ListGroup variant="flush" className="text-light">
            {posts.map((post) => (
              <ListGroup.Item
                key={post.id}
                className="bg-dark text-light d-flex justify-content-between align-items-center"
                style={{ borderBottom: "1px solid #444", padding: "8px 0" }}
              >
                <Row className="align-items-center gx-3" style={{ flexGrow: 1 }}>
                  {/* Avatar + Username + Date */}
                  <Col xs={12} sm={4} md={3} lg={3} className="d-flex align-items-center">
                    <div className="ms-2">
                      <strong style={{ fontSize: "0.95rem" }}>{post.user.username}</strong>
                      <br />
                      <small style={{ fontSize: "0.75rem", color: "#aaa" }}>
                        {new Date(post.createdAt).toLocaleString()}
                      </small>
                    </div>
                  </Col>

                  {/* Post Content */}
                  <Col xs={12} sm={5} md={6} lg={6} style={{ fontSize: "0.9rem", overflowWrap: "break-word" }}>
                    {post.content}
                  </Col>

                  {/* Topic Info */}
                  <Col xs={12} sm={3} md={3} lg={3} className="text-end">
                    {post.topicTitle && (
                      <div>
                        Titre: <strong>{post.topicTitle}</strong>
                      </div>
                    )}
                    {post.topicGenre && <div className="fw-bold">{post.topicGenre}</div>}
                  </Col>
                </Row>

                {/* Bouton Supprimer */}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteClick(post)}
                  style={{ marginLeft: "10px" }}
                >
                  Supprimer
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card>

      {/* Modal confirmation suppression */}
      <Modal show={showModal} onHide={handleCancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-dark fw_bold">Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-dark fw_bold">
          Voulez-vous vraiment supprimer ce post&nbsp;?
          <br />
          <em>{postToDelete?.content}</em>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PostManagement;
