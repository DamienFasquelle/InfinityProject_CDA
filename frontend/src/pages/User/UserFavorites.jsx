import React, { useEffect, useState } from 'react';
import { Spinner, Row, Col } from 'react-bootstrap';
import GameCard from '../../components/GameCard';

const API_URL = process.env.REACT_APP_API_URL;

const UserFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchFavorites = async () => {
      const res = await fetch(`${API_URL}/api/favorite/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFavorites(data);
    };
    fetchFavorites();
  }, []);

  useEffect(() => {
    const loadDetails = async () => {
      if (favorites.length === 0) {
        setLoading(false);
        return;
      }
      const { fetchGameDetails } = await import('../../services/rawgService');
      const details = await Promise.all(favorites.map(fetchGameDetails));
      setGames(details);
      setLoading(false);
    };
    loadDetails();
  }, [favorites]);

  return (
    <div style={{ padding: '0 1rem' }}>
  <h3 style={{ color: '#00ffff' }}>Mes jeux en favoris</h3>
  {loading ? (
    <Spinner animation="border" variant="info" />
  ) : (
    <Row className="gy-3 gx-2 justify-content-center">
      {games.map((game) => (
        <Col key={game.id} md={4} lg={2} sm={6}>
          <GameCard game={game} />
        </Col>
      ))}
    </Row>
  )}
</div>
  );
};

export default UserFavorites;
