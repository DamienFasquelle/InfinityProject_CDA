import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    // Simulation d'une requête vers l'API pour réinitialiser le mot de passe
    fetch('https://api.example.com/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setMessage('Mot de passe réinitialisé avec succès.');
        } else {
          setMessage("Une erreur s'est produite. Veuillez réessayer.");
        }
      })
      .catch(() => setMessage("Une erreur s'est produite. Veuillez réessayer."));
  };

  return (
    <div className="form-container">
      <h1>Réinitialiser le Mot de Passe</h1>
      <form onSubmit={handleResetPassword}>
        <label htmlFor="password">Nouveau mot de passe</label>
        <input
          type="password"
          id="password"
          placeholder="Entrez votre nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label htmlFor="confirmPassword">Confirmez le mot de passe</label>
        <input
          type="password"
          id="confirmPassword"
          placeholder="Confirmez votre nouveau mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit">Réinitialiser</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={() => navigate(-1)} className="btn-secondary">Retour</button>
    </div>
  );
};

export default ResetPassword;
