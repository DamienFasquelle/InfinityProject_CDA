import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';

const AdminDashboard = () => {
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token'); 

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/comments', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Accès refusé ou problème avec le token');
        }

        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, 
          },
        });

        if (!response.ok) {
          throw new Error('Accès refusé ou problème avec le token');
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
      }
    };

    if (token) {
      fetchComments();
      fetchUsers();
    } else {
      console.error('Aucun token trouvé. L\'utilisateur doit être connecté.');
    }
  }, [token]); 

  return (
    <div className="admin-dashboard-container">
      <h1 className="mb-4 text-center text-info">Tableau de Bord Administrateur</h1>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="info-card">
            <Card.Body>
              <Card.Title className="text-info">Commentaires</Card.Title>
              <Card.Text className="text-light">
                Gérer et consulter les commentaires des utilisateurs.
              </Card.Text>
              <div className="comments-list mt-3">
                {comments.length === 0 ? (
                  <p>Aucun commentaire trouvé.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <strong>{comment.user}</strong>: {comment.content} - <span>Note: {comment.rating}</span>
                      <br />
                      <span className="text-muted">Jeu ID: {comment.gameId}</span>
                    </div>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="info-card">
            <Card.Body>
              <Card.Title className="text-info">Utilisateurs</Card.Title>
              <Card.Text className="text-light">
                Liste des utilisateurs enregistrés.
              </Card.Text>
              <div className="users-list mt-3">
                {users.length === 0 ? (
                  <p>Aucun utilisateur trouvé.</p>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="comment-item">
                      <strong>{user.username}</strong> ({user.email}) - <span>Rôles: {user.roles.join(', ')}</span>
                    </div>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
