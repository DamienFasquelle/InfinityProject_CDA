import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAdmin: false,
    isUser: false,
    userInfo: null,
  });

  const navigate = useNavigate();

  // Décode un token JWT et renvoie les rôles + infos
  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles = payload.roles || [];
      return {
        isAuthenticated: true,
        isAdmin: roles.includes('ROLE_ADMIN'),
        isUser: roles.includes('ROLE_USER'),
        userInfo: payload,
      };
    } catch (err) {
      console.error("Erreur de décodage du token :", err);
      return {
        isAuthenticated: false,
        isAdmin: false,
        isUser: false,
        userInfo: null,
      };
    }
  };

  const login = useCallback((token) => {
    localStorage.setItem('token', token);
    const decoded = decodeToken(token);
    setAuthState(decoded);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthState({
      isAuthenticated: false,
      isAdmin: false,
      isUser: false,
      userInfo: null,
    });
    navigate('/login');
  }, [navigate]);

  // Vérifie le token à chaque chargement / actualisation
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      setAuthState(decoded);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
