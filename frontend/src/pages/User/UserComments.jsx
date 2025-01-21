import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

const UserComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleClick = (gameId) => {
    navigate(`/gamepage/${gameId}`);
  };

  useEffect(() => {
    if (!userInfo || !userInfo.userId) {
      console.error("Informations utilisateur non disponibles");
      setLoading(false);
      return;
    }

    const fetchComments = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Utilisateur non authentifié");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/users/${userInfo.userId}/comments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setComments(data);
        } else {
          console.error("Erreur lors de la récupération des commentaires");
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [userInfo]);

  if (loading) return <p>Chargement des commentaires...</p>;

  return (
    <div className="user-comments">
      <h2>Mes commentaires</h2>
      <div className="comments-list">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              <p className="comment-content">{comment.content}</p>
              <p className="comment-rating">Note : {comment.rating}</p>
              <Button onClick={() => handleClick(comment.gameId)}>
                Voir le jeu
              </Button>
            </div>
          ))
        ) : (
          <p>Aucun commentaire trouvé.</p>
        )}
      </div>
    </div>
  );
};

export default UserComments;
