// components/User/Comments.jsx
import React, { useEffect, useState } from 'react';
import { Spinner, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const UserComments = ({ userId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchComments = async () => {
      const res = await fetch(`${API_URL}/api/users/${userId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setComments(data.comments || []);
      setLoading(false);
    };
    fetchComments();
  }, [userId]);

  return (
    <div style={{ padding: '0 1rem' }}>
      <h3 style={{ color: '#00ffff' }}>Mes commentaires</h3>
      {loading ? (
        <Spinner animation="border" variant="info" />
      ) : (
        comments.map((comment) => (
          <Card key={comment.id} className="mb-3 bg-dark text-white">
            <Card.Body>
              <Card.Text>{comment.content}</Card.Text>
              <Badge bg="info">Note : {comment.rating}/5</Badge>
              <div className="text-end">
                <Button variant="outline-info" size="sm" onClick={() => navigate(`/gamepage/${comment.gameId}`)}>
                  Voir le jeu
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );
};

export default UserComments;
