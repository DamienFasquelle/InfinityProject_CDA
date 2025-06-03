import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const UserComments = ({ userId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL;
    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/${userId}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error('Erreur lors du chargement des commentaires', err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchComments();
  }, [userId]);

  return (
    <Card className="p-4 mb-4 shadow-sm">
      <h2 className="mb-4 text-primary">Commentaires</h2>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="info" />
          <p className="mt-3 text-muted">Chargement des commentaires...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center text-muted py-3">
          <p>Aucun commentaire n’a été posté.</p>
        </div>
      ) : (
        comments.map((comment) => (
          <Card key={comment.id} className="mb-3 shadow-sm border-info">
            <Card.Body>
              <Card.Text className="mb-2" style={{ fontSize: '1.1rem' }}>
                <strong>{comment.content}</strong>
              </Card.Text>
              <Badge bg="info" className="mb-2">
                Note : {comment.rating}/5
              </Badge>
              <div className="mt-3 text-end">
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={() => navigate(`/gamepage/${comment.gameId}`)}
                >
                  Voir le jeu
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </Card>
  );
};

export default UserComments;
