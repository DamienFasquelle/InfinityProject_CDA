import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import PasswordStrength from '../../components/PasswordStrength'; // adapte le chemin si besoin

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Erreur inconnue');

      setMessage(
        'Mot de passe modifié avec succès. Vous allez être redirigé vers la page de connexion.'
      );

      setTimeout(() => navigate('/login'), 3000);
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
              Réinitialiser le mot de passe
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
              <Form.Group controlId="password" className="mb-4 text-white">
                <PasswordStrength value={password} onChange={setPassword} />
              </Form.Group>

              <Button type="submit" className="btn-gradient w-100" style={{ fontWeight: 600 }}>
                Réinitialiser
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

export default ResetPassword;
