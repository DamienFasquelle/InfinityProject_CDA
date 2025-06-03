import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Form, Card } from 'react-bootstrap';
import { useGames } from '../providers/GameProvider';
import { fetchPlatforms, fetchGenres, fetchGames, fetchTags } from '../services/rawgService';
import GameCard from '../components/GameCard';

const Games = () => {
  const [games, setGames] = useState([]);
  const { gamesData, loading } = useGames();
  const [platforms, setPlatforms] = useState([]);
  const [genres, setGenres] = useState([]);
  const [tags, setTags] = useState([]);
  const [filters, setFilters] = useState({
    platform: '',
    genre: '',
    tag: '',
    rating: '',
  });

  const [gamesToShow, setGamesToShow] = useState(100);

  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const platformsData = await fetchPlatforms();
        const genresData = await fetchGenres();
        const tagsData = await fetchTags();
        const gamesData = await fetchGames();
        setPlatforms(platformsData.results);
        setGenres(genresData.results);
        setTags(tagsData.results);
        setGames(gamesData);
      } catch (error) {
        console.error("Erreur lors du chargement des filtres :", error);
      }
    };

    fetchFiltersData();
  }, []);

  useEffect(() => {
    if (gamesData && gamesData.length > 0) {
      setGames(gamesData);
    }
  }, [gamesData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      platform: '',
      genre: '',
      tag: '',
      rating: '',
    });
  };

  const filteredGames = games.filter((game) => {
    return (
      (filters.platform ? game.platforms.some(p => p.platform.name === filters.platform) : true) &&
      (filters.genre ? game.genres.some(g => g.name === filters.genre) : true) &&
      (filters.tag ? game.tags.some(t => t.name === filters.tag) : true) &&
      (filters.rating ? game.rating >= filters.rating : true)
    );
  });

  return (
    <div className="games-container fadeInUp">
      <Card className="filter-section p-4 mb-5 text-light bg-dark shadow-lg border-0">
        <h3 className="text-center text-primary mb-4">🎮 Filtrer les jeux</h3>
        <Row className="gy-3 justify-content-center">
          <Col md={2} sm={6} xs={12}>
            <Form.Group controlId="platform">
              <Form.Label>Plateforme</Form.Label>
              <Form.Select name="platform" value={filters.platform} onChange={handleFilterChange}>
                <option value="">Toutes</option>
                {platforms.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2} sm={6} xs={12}>
            <Form.Group controlId="genre">
              <Form.Label>Genre</Form.Label>
              <Form.Select name="genre" value={filters.genre} onChange={handleFilterChange}>
                <option value="">Tous</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2} sm={6} xs={12}>
            <Form.Group controlId="tag">
              <Form.Label>Tag</Form.Label>
              <Form.Select name="tag" value={filters.tag} onChange={handleFilterChange}>
                <option value="">Tous</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2} sm={6} xs={12}>
            <Form.Group controlId="rating">
              <Form.Label>Évaluation</Form.Label>
              <Form.Select name="rating" value={filters.rating} onChange={handleFilterChange}>
                <option value="">Toutes</option>
                <option value="4">4+</option>
                <option value="3">3+</option>
                <option value="2">2+</option>
                <option value="2">1+</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} className="text-center mt-3">
            <Button className="btn-gradient" onClick={handleResetFilters}>
              Réinitialiser les filtres
            </Button>
          </Col>
        </Row>
      </Card>

      <div className="container text-light">
        <h2 className="text-center text-primary mb-4">🎲 Jeux disponibles</h2>
        {loading ? (
          <p className="text-center">Chargement des jeux...</p>
        ) : (
          <Row className="justify-content-center">
            {filteredGames.slice(0, gamesToShow).map((game) => (
              <Col key={game.id} md={4} sm={6} lg={2} className="mb-4 fadeInUp">
                <GameCard game={game} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default Games;
