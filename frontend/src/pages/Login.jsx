import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useContext(AuthContext); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login_check', { email, password });
      const token = response.data.token;
      
      login(token); // Utiliser la fonction login du contexte

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
      setError('Échec de la connexion. Vérifiez vos identifiants.');
    }
  };

  return (
    <div className="form-container">
      <h1>Connexion</h1>

      {/* Afficher un message de succès ou d'erreur */}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Entrez votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          type="password"
          id="password"
          placeholder="Entrez votre mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Se connecter</button>
      </form>

      <div className="auth-links">
        <Link to="/signin">Pas encore inscrit ? S'inscrire</Link>
        <Link to="/forgot-password">Mot de passe oublié ?</Link>
      </div>
    </div>
  );
};

export default Login;
