import React, { createContext, useState, useEffect } from 'react';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favoriteGameIds, setFavoriteGameIds] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const OVH_URL = process.env.REACT_APP_OVH_URL;


  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); 

    if (token) {
      const fetchFavorites = async () => {
        try {
          const response = await fetch(`${OVH_URL}/favorite/list`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
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
    }
  }, []);

  const isFavorite = (gameId) => favoriteGameIds.includes(gameId); 

  const toggleFavorite = async (gameId) => {
    if (!isLoggedIn) {
      console.error("Vous devez être connecté pour modifier les favoris.");
      return;
    }

    const token = localStorage.getItem('token');
    const alreadyFavorite = isFavorite(gameId);
    const url = alreadyFavorite
      ? `${OVH_URL}/favorite/remove`
      : `${OVH_URL}/favorite/add`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gameId : gameId }),
      });

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
    <FavoritesContext.Provider value={{ favoriteGameIds, isFavorite, toggleFavorite, isLoggedIn }}>
      {children}
    </FavoritesContext.Provider>
  );
};
