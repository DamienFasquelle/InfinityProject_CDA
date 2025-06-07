import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Spinner, Alert } from 'react-bootstrap';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserComments, setSelectedUserComments] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!token) {
      setError('Utilisateur non connecté.');
      setLoadingUsers(false);
      return;
    }
    setLoadingUsers(true);
    fetch(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs.');
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoadingUsers(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingUsers(false);
      });
  }, [token, API_URL]);

  const handleUserClick = (userId) => {
    setLoadingComments(true);
    setSelectedUserComments(null);
    setError(null);
    fetch(`${API_URL}/api/users/${userId}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Erreur lors du chargement des commentaires.');
        return res.json();
      })
      .then((data) => {
        setSelectedUserComments(data);
        setLoadingComments(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingComments(false);
      });
  };

  if (loadingUsers) {
    return (
      <div className="text-center my-3">
        <Spinner animation="border" variant="info" />
        <p>Chargement des utilisateurs...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <>
      <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <h5>Utilisateurs ({users.length})</h5>
        {users.length === 0 ? (
          <p>Aucun utilisateur trouvé.</p>
        ) : (
          <ListGroup>
            {users.map((user) => (
              <ListGroup.Item
                key={user.id}
                action
                onClick={() => handleUserClick(user.id)}
                style={{ cursor: 'pointer' }}
              >
                <strong>{user.username}</strong> - {user.email}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>

      <Card.Body style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '1rem' }}>
        <h5>
          {selectedUserComments
            ? `Commentaires de ${selectedUserComments.user.username}`
            : 'Commentaires utilisateur'}
        </h5>
        {loadingComments ? (
          <Spinner animation="border" variant="info" />
        ) : selectedUserComments ? (
          selectedUserComments.comments.length === 0 ? (
            <p>Aucun commentaire trouvé pour cet utilisateur.</p>
          ) : (
            <ListGroup>
              {selectedUserComments.comments.map((c) => (
                <ListGroup.Item key={c.id}>
                  {c.content}
                  <br />
                  <small className="text-muted">
                    Note: {c.rating} - Jeu ID: {c.gameId} - Posté le: {new Date(c.created_at).toLocaleDateString()}
                  </small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )
        ) : (
          <p>Cliquez sur un utilisateur pour voir ses commentaires.</p>
        )}
      </Card.Body>
    </>
  );
};

export default UserManagement;
