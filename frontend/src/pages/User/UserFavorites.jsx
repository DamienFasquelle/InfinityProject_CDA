import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import GameCard from '../../components/GameCard';
import { fetchGameDetails } from '../../services/rawgService';

const UserFavorites = () => {
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [gameDetails, setGameDetails] = useState([]);

  useEffect(() => {
      const API_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem('token');
    const fetchFavorites = async () => {
      const res = await fetch(`${API_URL}/api/favorite/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFavoriteGames(data);
    };
    fetchFavorites();
  }, []);

  useEffect(() => {
    const loadDetails = async () => {
      const details = await Promise.all(favoriteGames.map(fetchGameDetails));
      setGameDetails(details);
    };
    if (favoriteGames.length) loadDetails();
  }, [favoriteGames]);

  return (
    <Card className="p-4 mb-4 shadow-sm">
      <h2 className='text-center'>Jeux favoris</h2>
      <Row className="mt-3 g-4">
        {gameDetails.map((game) => (
          <Col key={game.id} md={4} lg={3}>
            <GameCard game={game} />
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default UserFavorites;
