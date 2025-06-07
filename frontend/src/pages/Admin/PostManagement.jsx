import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Spinner, Alert } from 'react-bootstrap';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!token) {
      setError('Utilisateur non connecté.');
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API_URL}/api/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Erreur lors du chargement des commentaires.');
        return res.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token, API_URL]);

  if (loading) {
    return (
      <div className="text-center my-3">
        <Spinner animation="border" variant="info" />
        <p>Chargement des commentaires...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <h5>Commentaires / Posts ({posts.length})</h5>
      {posts.length === 0 ? (
        <p>Aucun commentaire trouvé.</p>
      ) : (
        <ListGroup>
          {posts.map((post) => (
            <ListGroup.Item key={post.id}>
              <strong>{post.user}</strong>: {post.content}
              <br />
              <small className="text-muted">
                Note: {post.rating} - Jeu ID: {post.gameId} - Posté le: {new Date(post.created_at).toLocaleDateString()}
              </small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Card.Body>
  );
};

export default PostManagement;
