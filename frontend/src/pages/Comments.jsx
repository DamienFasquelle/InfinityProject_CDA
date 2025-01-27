import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";


const Comments = ({
  comments,
  gameId,
  isConnected,
  isAdmin,
  onCommentAdded,
  onCommentDeleted,
  onCommentEdited,
}) => {
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [editedRating, setEditedRating] = useState(null);
  const OVH_URL = process.env.REACT_APP_OVH_URL;


  const handleNewCommentSubmit = async (e) => {
    const token = localStorage.getItem("token");
    e.preventDefault();
    if (!token) {
      setError("Vous devez être connecté pour publier un commentaire.");
      return;
    }
    const decodedToken = jwtDecode(token);
    const userRoles = decodedToken.roles || [];
    const isUserRole = userRoles.includes("ROLE_USER");

    if (!isUserRole) {
      setError("Vous devez être un utilisateur pour publier un commentaire.");
      return;
    }

    const commentData = {
      content: newComment,
      rating: newRating,
      gameId,
    };

    try {
      const response = await fetch(`${OVH_URL}/api/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(commentData),
      });

      if (response.status === 201) {
        setNewComment("");
        setNewRating(1);
        setSuccess("Commentaire ajouté avec succès.");
        onCommentAdded(); // Actualiser la liste des commentaires
      }
    } catch (err) {
      setError("Une erreur s'est produite.");
      console.error("Erreur de requête :", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${OVH_URL}/api/comment/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        onCommentDeleted(commentId); // Actualiser la liste des commentaires
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire", error);
    }
  };

  const handleEditComment = async (commentId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${OVH_URL}/api/comment/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editedComment,
          rating: editedRating,
          gameId,
        }),
      });
      if (response.status === 200) {
        setIsEditing(null);
        setEditedComment("");
        setEditedRating(null);
        onCommentEdited();
      }
    } catch (error) {
      console.error("Erreur lors de la modification du commentaire", error);
    }
  };

  const startEditing = (commentId, content, rating) => {
    setIsEditing(commentId);
    setEditedComment(content);
    setEditedRating(rating);
  };

  return (
    <div>
      <h2>Commentaires</h2>
      {comments.length > 0 ? (
        <div className="comments-list">
          {comments.map((comment) => {
            const token = localStorage.getItem('token');
            const decodedToken = token ? jwtDecode(token) : null;
            const userId = decodedToken?.userId;
            const isAdminUser = decodedToken?.roles?.includes('ROLE_ADMIN');
            return (
              <div key={comment.id} className="comment">
                {isEditing === comment.id ? (
                  <div>
                    <textarea
                      value={editedComment}
                      onChange={(e) => setEditedComment(e.target.value)}
                    />
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={editedRating}
                      onChange={(e) =>
                        setEditedRating(Number(e.target.value))
                      }
                    />
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      className="btn-gradient"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => setIsEditing(null)}
                      className="btn-danger"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <div>
                    <p>
                      <strong>{comment.user}</strong> - {comment.created_at}
                    </p>
                    <p>{comment.content}</p>
                    <p>Note: {comment.rating} / 5</p>
                    {(comment.userId === userId || isAdminUser) && (
                      <div>
                        <button
                          onClick={() =>
                            startEditing(comment.id, comment.content, comment.rating)
                          }
                          className="btn-gradient"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="btn-danger"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p>Aucun commentaire pour ce jeu.</p>
      )}

      {isConnected && !isAdmin && (
        <section className="my-4">
          <h3>Ajouter un Commentaire</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <Form onSubmit={handleNewCommentSubmit}>
            <Form.Group controlId="content">
              <Form.Label>Votre Commentaire</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="rating">
              <Form.Label>Note (1 à 5)</Form.Label>
              <Form.Control
                as="select"
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
                required
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Button type="submit">Soumettre</Button>
          </Form>
        </section>
      )}
    </div>
  );
};

export default Comments;
