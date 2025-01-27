import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../providers/AuthProvider';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const OVH_URL = process.env.REACT_APP_OVH_URL;
  const APP_URL_LOCAL = process.env.REACT_APP_URL_LOCAL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!OVH_URL) {
      console.error('REACT_APP_OVH_URL n\'est pas défini.');
    }
    console.log('OVH_URL:', `${OVH_URL}/login_check`);

    try {
      const response = await axios.post(`${OVH_URL}/api/login_check`, {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, 
      });
      
      
      const token = response.data.token;

      login(token);

      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userRole = decodedToken.roles[0];

      if (userRole === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if (userRole === 'ROLE_USER') {
        navigate('/user');
      } else {
        navigate('/');
      }

      setSuccess('Connexion réussie !');
    } catch (err) {
      if (err.response) {
        // Erreur côté serveur
        setError(err.response.data.message || 'Erreur inconnue sur le serveur.');
      } else if (err.request) {
        // Aucune réponse reçue
        setError('Le serveur ne répond pas. Vérifiez votre connexion.');
      } else {
        // Erreur de configuration
        setError('Une erreur inattendue est survenue.');
      }
    }
    
  };

  return (
    <div className="form-container">
      <h1>Connexion</h1>

      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col xs={12} md={12}>
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
