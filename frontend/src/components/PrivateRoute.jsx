import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // Si l'utilisateur n'est pas authentifié, redirige vers la page de login
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // Décoder le token pour obtenir les rôles de l'utilisateur
  const decodedToken = JSON.parse(atob(token.split('.')[1]));
  const userRole = decodedToken.roles[0];

  if (!allowedRoles.includes(userRole)) {
    // Si l'utilisateur n'a pas le rôle requis, redirige vers la page d'accueil ou une autre page
    return <Navigate to="/" />;
  }

  // Si l'utilisateur est authentifié et a le rôle correct, rendre l'enfant
  return children;
};

export default PrivateRoute;
