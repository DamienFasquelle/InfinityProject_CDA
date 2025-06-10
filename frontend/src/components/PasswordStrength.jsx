import React, { useState, useEffect } from 'react';

const validatePassword = (password) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

const PasswordStrength = ({ value, onChange }) => {
  const [criteria, setCriteria] = useState(validatePassword(value));

  useEffect(() => {
    setCriteria(validatePassword(value));
  }, [value]);

  const getColor = (isValid) => (isValid ? 'green' : 'gray');

  return (
    <div>
      <label className="form-label">Mot de passe</label>
      <input
        type="password"
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Entrez un mot de passe fort"
      />

      <ul className="list-unstyled mt-2" style={{ fontSize: '0.9rem' }}>
        <li style={{ color: getColor(criteria.length) }}>
          {criteria.length ? '✔' : '❌'} Au moins 8 caractères
        </li>
        <li style={{ color: getColor(criteria.uppercase) }}>
          {criteria.uppercase ? '✔' : '❌'} Une majuscule
        </li>
        <li style={{ color: getColor(criteria.lowercase) }}>
          {criteria.lowercase ? '✔' : '❌'} Une minuscule
        </li>
        <li style={{ color: getColor(criteria.number) }}>
          {criteria.number ? '✔' : '❌'} Un chiffre
        </li>
        <li style={{ color: getColor(criteria.specialChar) }}>
          {criteria.specialChar ? '✔' : '❌'} Un caractère spécial (!@#$...)
        </li>
      </ul>
    </div>
  );
};

export default PasswordStrength;
