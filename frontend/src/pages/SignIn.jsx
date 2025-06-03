import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';

const SignIn = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const data = { email, username, password };

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          throw new Error(errorData.message);
        } else {
          throw new Error('Erreur lors de l’inscription. Veuillez vérifier les informations.');
        }
      }

      setSuccess(true);
      alert('Inscription réussie, veuillez vous connecter !');
      navigate('/login');
    } catch (err) {
      if (err.name === 'TypeError') {
        setError('Le serveur ne répond pas. Vérifiez votre connexion.');
      } else {
        setError(err.message || 'Une erreur inconnue est survenue.');
      }
      setSuccess(false);
    }
  };

  return (
    <Container
      fluid="sm"
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '80vh' }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <div
            className="form-container card p-4"
            style={{ borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow)' }}
          >
            <h2 className="card-title text-center mb-4">
              Inscription
            </h2>

            {error && (
              <Alert variant="danger" className="text-center">
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success" className="text-center">
                Inscription réussie !
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="username" className="mb-3 text-white">
                <Form.Label>Nom utilisateur</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Entrez votre prénom"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="email" className="mb-3 text-white">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="password" className="mb-4 text-white">
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button type="submit" className="btn-gradient w-100" style={{ fontWeight: 600 }}>
                S'inscrire
              </Button>
            </Form>

            <div className="mt-3 text-center" style={{ fontSize: '0.9rem' }}>
              <Link to="/login">Déjà inscrit ? Se connecter</Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SignIn;
