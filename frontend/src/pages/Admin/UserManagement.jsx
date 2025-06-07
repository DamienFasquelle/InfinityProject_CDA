import React, { useEffect, useState } from "react";
import { Card, ListGroup, Spinner, Alert, Accordion } from "react-bootstrap";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!token) {
      setError("Utilisateur non connecté.");
      setLoadingUsers(false);
      return;
    }
    setLoadingUsers(true);
    fetch(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs.");
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

  const loadComments = (user) => {
    setSelectedUser(user);
    setLoadingComments(true);
    setComments([]);
    setError(null);

    fetch(`${API_URL}/api/users/${user.id}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement des commentaires.");
        return res.json();
      })
      .then((data) => {
        // On suppose que data.comments est un tableau
        setComments(data.comments || []);
        setLoadingComments(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingComments(false);
      });
  };

  if (loadingUsers) {
    return (
      <div className="text-center my-3 text-light">
        <Spinner animation="border" variant="light" />
        <p>Chargement des utilisateurs...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="p-3" style={{ backgroundColor: "#121212", minHeight: "100vh", color: "#eee" }}>
      <h3>Liste des utilisateurs</h3>
      <Card
        style={{ maxHeight: "300px", overflowY: "auto", backgroundColor: "#1f1f1f", color: "#eee" }}
        className="mb-4"
      >
        {users.length === 0 ? (
          <p>Aucun utilisateur trouvé.</p>
        ) : (
          <ListGroup variant="flush">
            {users.map((user) => (
              <ListGroup.Item
                key={user.id}
                action
                onClick={() => loadComments(user)}
                style={{
                  cursor: "pointer",
                  backgroundColor: selectedUser?.id === user.id ? "#333" : "transparent",
                  color: "#eee",
                }}
              >
                {user.username} ({user.email})
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card>

      <h4>
        {selectedUser
          ? `Commentaires de ${selectedUser.username}`
          : "Cliquez sur un utilisateur pour voir ses commentaires"}
      </h4>

      <Card
        style={{ maxHeight: "400px", overflowY: "auto", backgroundColor: "#1f1f1f", color: "#eee" }}
      >
        {loadingComments ? (
          <div className="text-center p-3">
            <Spinner animation="border" variant="light" />
            <p>Chargement des commentaires...</p>
          </div>
        ) : comments.length === 0 ? (
          <p className="p-3">Aucun commentaire trouvé.</p>
        ) : (
          <Accordion flush alwaysOpen>
            {comments.map((comment) => (
              <Accordion.Item
                eventKey={comment.id.toString()}
                key={comment.id}
                style={{ backgroundColor: "#2c2c2c", color: "#eee" }}
              >
                <Accordion.Header style={{ backgroundColor: "#2c2c2c", color: "#eee" }}>
                  {comment.content.length > 40
                    ? comment.content.slice(0, 40) + "..."
                    : comment.content}
                </Accordion.Header>
                <Accordion.Body style={{ backgroundColor: "#3a3a3a", color: "#ddd" }}>
                  <p>{comment.content}</p>
                  <p>
                    <small>
                      Note: {comment.rating} / 5<br />
                      Jeu ID: {comment.gameId}<br />
                      Posté le: {new Date(comment.created_at).toLocaleDateString()}
                    </small>
                  </p>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Card>
    </div>
  );
};

export default UserManagement;
