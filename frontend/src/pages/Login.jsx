import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Col, Form, Row, Container, Alert } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../providers/AuthProvider';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);

  const API_URL = process.env.REACT_APP_API_URL;

  const handleLoginSuccess = () => {
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const data = { email, password };

    try {
      const response = await fetch(`${API_URL}/api/login_check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.message || 'Identifiants incorrects.';
        throw new Error(message);
      }

      const result = await response.json();

      login(result.token);
      handleLoginSuccess();
    } catch (err) {
      if (err.name === 'TypeError') {
        setError('Le serveur ne répond pas. Vérifiez votre connexion.');
      } else {
        setError(err.message || 'Erreur inconnue.');
      }
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
              Connexion
            </h2>

            {error && (
              <Alert variant="danger" className="text-center">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="email" className="mb-3 text-white">
                <Form.Label>Email :</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="password" className="mb-4 text-white">
                <Form.Label>Mot de passe :</Form.Label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <Button
                    variant="outline-light"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      height: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>
              </Form.Group>

              <Button type="submit" className="btn-gradient w-100" style={{ fontWeight: 600 }}>
                Se connecter
              </Button>
            </Form>

            <div className="mt-3 text-center" style={{ fontSize: '0.9rem' }}>
              <Link to="/signin">Pas encore inscrit ? S'inscrire</Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
