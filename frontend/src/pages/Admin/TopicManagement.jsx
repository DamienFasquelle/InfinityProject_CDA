import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Spinner, Alert } from 'react-bootstrap';

const TopicManagement = () => {
  const [topics, setTopics] = useState([]);
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
    fetch(`${API_URL}/api/topic/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Erreur lors du chargement des topics.');
        return res.json();
      })
      .then((data) => {
        setTopics(data);
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
        <p>Chargement des topics...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <h5>Liste des Topics ({topics.length})</h5>
      {topics.length === 0 ? (
        <p>Aucun topic trouvé.</p>
      ) : (
        <ListGroup>
          {topics.map((topic) => (
            <ListGroup.Item key={topic.id}>
              <strong>{topic.title}</strong> - Genre: {topic.genre?.name || 'N/A'}
              <br />
              <small>{topic.description}</small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Card.Body>
  );
};

export default TopicManagement;
