import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { fetchGameDetails } from '../../services/rawgService';
import GameCard from '../../components/GameCard';

const UserFavorites = () => {
  const [favoriteGames, setFavoriteGames] = useState([]); 
  const [gameDetails, setGameDetails] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchFavoriteGames = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Utilisateur non authentifié');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/favorite/list`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFavoriteGames(data); 
        } else {
          console.error('Erreur lors de la récupération des jeux favoris');
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchFavoriteGames();
  }, []); 

  useEffect(() => {
    const fetchGameDetailsForFavorites = async () => {
      if (favoriteGames.length === 0) return;

      setLoading(true);
      try {
    
        const details = await Promise.all(
          favoriteGames.map(async (gameId) => {
         
            const gameDetail = await fetchGameDetails(gameId);
            return gameDetail;
          })
        );

        setGameDetails(details); 
      } catch (error) {
        console.error('Erreur lors de la récupération des détails des jeux', error);
      } finally {
        setLoading(false); 
      }
    };

    fetchGameDetailsForFavorites(); 
  }, [favoriteGames]); 
  return (
    <div className="user-dashboard-container">
      <h1 className="mb-4">Mes jeux en favoris</h1>

      <Row className="justify-content-center">
        {loading ? (
          <Col>
            <div className="text-center">
              <h4>Chargement des jeux favoris...</h4>
            </div>
          </Col>
        ) : gameDetails.length > 0 ? (
          gameDetails.map((game) => (
            <Col key={game.id} md={4} sm={6} lg={2} className="mb-4">
              <GameCard game={game} />
            </Col>
          ))
        ) : (
          <Col>
            <div className="text-center">
              <h4>Aucun jeu favori</h4>
              <p>Vous n'avez pas encore ajouté de jeux à vos favoris.</p>
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default UserFavorites;
