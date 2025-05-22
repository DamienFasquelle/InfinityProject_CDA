import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

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
        const message =
          errorData.message || 'Identifiants incorrects.';
        throw new Error(message);
      }

      const result = await response.json();
      localStorage.setItem('token', result.token);
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
    <div className="form-container">
      <h1>Connexion</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col xs={12}>
            <Form.Group controlId="email">
              <Form.Label>Email :</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Entrez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>

       <Row className="mb-3">
          <Col xs={12} md={12}>
            <Form.Group controlId="password">
              <Form.Label>Mot de passe :</Form.Label>
              <div className="password-container d-flex">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                 <Col xs={2} md={2}>
                <Button
                  type="button"
                  className="toggle-password ms-1"
                  onClick={() => setShowPassword((prev) => !prev)}
                  variant="outline-secondary"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
                </Col>
              </div>
            </Form.Group>
          </Col>
        </Row>

        <Button type="submit" variant="primary">
          Se connecter
        </Button>
      </Form>

      <div className="auth-links mt-3">
        <Link to="/signin">Pas encore inscrit ? S'inscrire</Link>
      </div>
    </div>
  );
};

export default Login;