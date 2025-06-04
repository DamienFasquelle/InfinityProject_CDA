import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthProvider';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favoriteGameIds, setFavoriteGameIds] = useState([]);
  const [tokenExpired, setTokenExpired] = useState(false);
  const { isAuthenticated } = useContext(AuthContext); 
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (isAuthenticated && token) {
      const fetchFavorites = async () => {
        try {
          const response = await fetch(`${API_URL}/api/favorite/list`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 401) {
            setTokenExpired(true);
            localStorage.removeItem('token');
            setFavoriteGameIds([]);
            return;
          }

          if (response.ok) {
            const data = await response.json();
            setFavoriteGameIds(data);
          } else {
            console.error("Erreur lors de la récupération des favoris");
          }
        } catch (error) {
          console.error("Erreur:", error);
        }
      };

      fetchFavorites();
    } else {
      setFavoriteGameIds([]);
    }
  }, [isAuthenticated]);

  const isFavorite = (gameId) => favoriteGameIds.includes(gameId);

  const toggleFavorite = async (gameId) => {
    if (!isAuthenticated) {
      alert("Vous n'êtes pas connecté.");
      return;
    }

    const token = localStorage.getItem('token');
    const alreadyFavorite = isFavorite(gameId);
    const url = alreadyFavorite
      ? `${API_URL}/api/favorite/remove`
      : `${API_URL}/api/favorite/add`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gameId }),
      });

      if (response.status === 401) {
        setTokenExpired(true);
        localStorage.removeItem('token');
        return;
      }

      if (response.ok) {
        setFavoriteGameIds((prev) =>
          alreadyFavorite
            ? prev.filter((id) => id !== gameId)
            : [...prev, gameId]
        );
      } else {
        console.error("Erreur lors de la mise à jour des favoris");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favoriteGameIds, isFavorite, toggleFavorite, isAuthenticated }}>
      <>
        {tokenExpired && (
          <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', marginBottom: '10px' }}>
            Votre session a expiré. Veuillez recharger la page ou vous reconnecter.
          </div>
        )}
        {children}
      </>
    </FavoritesContext.Provider>
  );
};
