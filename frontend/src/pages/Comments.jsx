import React, { useContext, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../providers/AuthProvider";

const Comments = ({ comments, gameId, onCommentAdded, onCommentDeleted, onCommentEdited }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const userId = decodedToken?.userId;
  const isAdminUser = decodedToken?.roles?.includes("ROLE_ADMIN");

  const showMessageAndReload = (message, isSuccess = true) => {
    if (isSuccess) setSuccess(message);
    else setError(message);

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleNewCommentSubmit = async (e) => {
    e.preventDefault();
    if (!token) return setError("Vous devez être connecté pour publier un commentaire.");
    if (!decodedToken.roles?.includes("ROLE_USER"))
      return setError("Vous devez être un utilisateur pour publier un commentaire.");

    const form = e.target;
    const content = form.content.value;
    const rating = Number(form.rating.value);

    try {
      const response = await fetch(`${API_URL}/api/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, rating, gameId }),
      });

      if (response.status === 201) {
        showMessageAndReload("Commentaire ajouté avec succès.");
      } else {
        showMessageAndReload("Erreur lors de l'ajout du commentaire.", false);
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire :", err);
      showMessageAndReload("Erreur serveur lors de l'ajout.", false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/comment/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showMessageAndReload("Commentaire supprimé avec succès.");
      } else {
        showMessageAndReload("Erreur lors de la suppression du commentaire.", false);
      }
    } catch (err) {
      console.error("Erreur de suppression :", err);
      showMessageAndReload("Erreur serveur.", false);
    }
  };

  const handleEditComment = async (commentId) => {
    const form = document.getElementById(`edit-form-${commentId}`);
    const content = form?.content.value;
    const rating = Number(form?.rating.value);

    if (!content || !rating) return setError("Remplissez tous les champs.");

    try {
      const res = await fetch(`${API_URL}/api/comment/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          rating,
          gameId,
        }),
      });

      if (res.ok) {
        showMessageAndReload("Commentaire modifié avec succès.");
      } else {
        showMessageAndReload("Erreur lors de la modification.", false);
      }
    } catch (err) {
      console.error("Erreur de modification :", err);
      showMessageAndReload("Erreur serveur.", false);
    }
  };

  const startEditing = (commentId) => {
    setIsEditing(commentId);
  };

  const cancelEditing = () => {
    setIsEditing(null);
    setError("");
    setSuccess("");
  };

  return (
    <div>
      <h2>Commentaires</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {comments.length > 0 ? (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment mb-3 p-3 rounded text-light bg-dark">
              {isEditing === comment.id ? (
                <Form id={`edit-form-${comment.id}`} className="mb-3">
                  <Form.Control
                    as="textarea"
                    name="content"
                    rows={3}
                    defaultValue={comment.content}
                    className="mb-2"
                    required
                  />
                  <Form.Select
                    name="rating"
                    defaultValue={comment.rating}
                    className="mb-2"
                    required
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </Form.Select>
                  <Button variant="success" size="sm" onClick={() => handleEditComment(comment.id)} className="me-2">
                    Enregistrer
                  </Button>
                  <Button variant="secondary" size="sm" onClick={cancelEditing}>
                    Annuler
                  </Button>
                </Form>
              ) : (
                <>
                  <p><strong>{comment.user}</strong> - {new Date(comment.created_at).toLocaleString()}</p>
                  <p>{comment.content}</p>
                  <p>Note : {comment.rating} / 5</p>
                  {(comment.userId === userId || isAdminUser) && userId && (
                    <div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => startEditing(comment.id)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>Aucun commentaire pour ce jeu.</p>
      )}

      {isAuthenticated && (
        <section className="mt-4">
          <h3>Ajouter un Commentaire</h3>
          <Form onSubmit={handleNewCommentSubmit}>
            <Form.Group controlId="content" className="mb-3">
              <Form.Label>Votre commentaire</Form.Label>
              <Form.Control
                as="textarea"
                name="content"
                rows={3}
                required
              />
            </Form.Group>
            <Form.Group controlId="rating" className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Select
                name="rating"
                defaultValue={1}
                required
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="primary">Soumettre</Button>
          </Form>
        </section>
      )}
    </div>
  );
};

export default Comments;
