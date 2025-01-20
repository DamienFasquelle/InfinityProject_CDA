import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Form} from 'react-bootstrap';
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
        console.error("Error fetching filter data: ", error);
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
    <div className="games-container">
      <div className="filter-section mb-4 text-center">
        <h3>Filtrer les jeux</h3>
        
        {/* Filters row */}
        <Row className="justify-content-center">
          {/* Plateforme Filter */}
          <Col md={2} sm={6} xs={12}>
            <Form.Group controlId="platform">
              <Form.Label>Plateforme</Form.Label>
              <Form.Control
                as="select"
                name="platform"
                value={filters.platform}
                onChange={handleFilterChange}
              >
                <option value="">Toutes les plateformes</option>
                {platforms.map((platform) => (
                  <option key={platform.id} value={platform.name}>
                    {platform.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>

          {/* Genre Filter */}
          <Col md={2} sm={6} xs={12}>
            <Form.Group controlId="genre">
              <Form.Label>Genre</Form.Label>
              <Form.Control
                as="select"
                name="genre"
                value={filters.genre}
                onChange={handleFilterChange}
              >
                <option value="">Tous les genres</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.name}>
                    {genre.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>

          {/* Tag Filter */}
          <Col md={2} sm={6} xs={12}>
            <Form.Group controlId="tag">
              <Form.Label>Tag</Form.Label>
              <Form.Control
                as="select"
                name="tag"
                value={filters.tag}
                onChange={handleFilterChange}
              >
                <option value="">Tous les tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.name}>
                    {tag.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>

          {/* Rating Filter */}
          <Col md={2} sm={6} xs={12}>
            <Form.Group controlId="rating">
              <Form.Label>Évaluation</Form.Label>
              <Form.Control
                as="select"
                name="rating"
                value={filters.rating}
                onChange={handleFilterChange}
              >
                <option value="">Toutes les évaluations</option>
                <option value="4">4 étoiles et plus</option>
                <option value="3">3 étoiles et plus</option>
                <option value="2">2 étoiles et plus</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        {/* Reset Button */}
        <Button 
          variant="secondary" 
          className="mt-3"
          onClick={handleResetFilters}
        >
          Réinitialiser les filtres
        </Button>
      </div>

      <div className="container">
        <h2 className="mt-4 text-center">Jeux disponibles</h2>
        {loading ? (
          <p>Chargement des jeux...</p>
        ) : (
          <Row className="justify-content-center">
            {filteredGames.slice(0, gamesToShow).map((game) => (
              <Col key={game.id} md={4} sm={6} lg={2} className="mb-4">
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
