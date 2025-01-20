import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = (e) => {
    e.preventDefault();

    // Simulation d'une requête vers l'API pour réinitialiser le mot de passe
    fetch('https://api.example.com/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setMessage('Un email de réinitialisation a été envoyé.');
        } else {
          setMessage("Une erreur s'est produite. Veuillez réessayer.");
        }
      })
      .catch(() => setMessage("Une erreur s'est produite. Veuillez réessayer."));
  };

  return (
    <div className="form-container">
      <h1>Mot de Passe Oublié</h1>
      <form onSubmit={handleForgotPassword}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Entrez votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Envoyer</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={() => navigate(-1)} className="btn-secondary mt-2">Retour</button>
    </div>
  );
};

export default ForgotPassword;
