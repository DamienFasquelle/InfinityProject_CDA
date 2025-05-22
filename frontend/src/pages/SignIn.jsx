import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
      const response = await fetch(`${API_URL}/register`, {
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
    <div className="form-container">
      <h1>Inscription</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Inscription réussie !</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Nom utilisateur</label>
        <input
          type="text"
          id="username"
          placeholder="Entrez votre prénom"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

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

        <button type="submit">S'inscrire</button>
      </form>

      <Link to="/login">Déjà inscrit ? Se connecter</Link>
    </div>
  );
};

export default SignIn;
