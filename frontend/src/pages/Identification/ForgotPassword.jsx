import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Erreur inconnue');

      setMessage(' Redirection vers la page de réinitialisation du mot de passe...');
      setTimeout(() => {
        navigate(`/reset-password/${data.token}`);
      }, 2000);
    } catch (err) {
      setError(err.message);
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
            <h2 className="card-title text-center mb-4" style={{ color: 'var(--primary)' }}>
              Mot de passe oublié
            </h2>

            {message && (
              <Alert variant="success" className="text-center">
                {message}
              </Alert>
            )}
            {error && (
              <Alert variant="danger" className="text-center">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="email" className="mb-4 text-white">
                <Form.Label>Adresse email :</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Button type="submit" className="btn-gradient w-100 mb-2" style={{ fontWeight: 600 }}>
                Envoyer
              </Button>
            </Form>

            <div className="mt-3 text-center" style={{ fontSize: '0.9rem' }}>
              <Link to="/login">← Retour à la connexion</Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
