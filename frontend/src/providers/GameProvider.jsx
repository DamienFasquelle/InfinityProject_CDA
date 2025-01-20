import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchGames, fetchGameDetails, fetchGameScreenshots, fetchGenres, searchGames } from '../services/rawgService'; 

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      setError(null);
      try {
        const allGamesData = await fetchGames(20);
        setGames(allGamesData);
      } catch (error) {
        setError("Impossible de charger les jeux. Veuillez réessayer plus tard.");
        console.error('Erreur lors du chargement des jeux:', error);
      } finally {
        setLoading(false);
      }
    };
  
    loadGames();
  }, []);

  const handleSearch = async (query) => {
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchData = await searchGames(query); 
      setSearchResults(searchData.results); 
    } catch (error) {
      console.error('Erreur lors de la recherche de jeux:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGameDetails = async (gameId) => {
    try {
      const details = await fetchGameDetails(gameId);
      const screenshots = await fetchGameScreenshots(gameId);
      const genres = await fetchGenres();
      return { details, screenshots, genres };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du jeu:', error);
      throw error;
    }
  };

  return (
    <GameContext.Provider value={{ games, getGameDetails, loading, searchResults, handleSearch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGames = () => useContext(GameContext);
