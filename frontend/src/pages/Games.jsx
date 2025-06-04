import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Form, Card } from 'react-bootstrap';
import { fetchPlatforms, fetchGenres, fetchGames, fetchTags } from '../services/rawgService';
import GameCard from '../components/GameCard';

const Games = () => {
  const [games, setGames] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [genres, setGenres] = useState([]);
  const [tags, setTags] = useState([]);
  
  const [filters, setFilters] = useState({
    platform: '',
    genre: '',
    tag: '',
    rating: '',
  });

  const [pendingFilters, setPendingFilters] = useState(filters);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Chargement des filtres (plateformes, genres, tags)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [platformsData, genresData, tagsData] = await Promise.all([
          fetchPlatforms(),
          fetchGenres(),
          fetchTags(),
        ]);
        setPlatforms(platformsData?.results || []);
        setGenres(genresData?.results || []);
        setTags(tagsData?.results || []);
      } catch (error) {
        console.error("Erreur lors du chargement des filtres :", error);
      }
    };

    fetchFilters();
  }, []);

  // Chargement des jeux (paginés + filtres)
  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      try {
        const gamesData = await fetchGames({
          page,
          pageSize: 20,
          filters,
        });

        if (gamesData && gamesData.results) {
          setGames(gamesData.results);
          setTotalPages(Math.ceil(gamesData.count / 20));
        } else {
          setGames([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des jeux :", error);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [page, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setPendingFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    setFilters(pendingFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    const empty = {
      platform: '',
      genre: '',
      tag: '',
      rating: '',
    };
    setFilters(empty);
    setPendingFilters(empty);
    setPage(1);
  };

  return (
    <section className="games-container">
      <div className="filter-section p-4 mb-5 text-light bg-dark shadow-lg border-0">
        <h3 className="text-center text-primary mb-4">🎮 Filtrer les jeux</h3>
        <Row className="gy-3 justify-content-center">
          <Col md={2} sm={6} xs={12}>
            <Form.Group controlId="platform">
              <Form.Label>Plateforme</Form.Label>
              <Form.Select name="platform" value={pendingFilters.platform} onChange={handleFilterChange}>
                <option value="">Toutes</option>
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2} sm={6} xs={12}>
            <Form.Group controlId="genre">
              <Form.Label>Genre</Form.Label>
              <Form.Select name="genre" value={pendingFilters.genre} onChange={handleFilterChange}>
                <option value="">Tous</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2} sm={6} xs={12}>
            <Form.Group controlId="tag">
              <Form.Label>Tag</Form.Label>
              <Form.Select name="tag" value={pendingFilters.tag} onChange={handleFilterChange}>
                <option value="">Tous</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2} sm={6} xs={12}>
            <Form.Group controlId="rating">
              <Form.Label>Évaluation</Form.Label>
              <Form.Select name="rating" value={pendingFilters.rating} onChange={handleFilterChange}>
                <option value="">Toutes</option>
                <option value="4">4+</option>
                <option value="3">3+</option>
                <option value="2">2+</option>
                <option value="1">1+</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} className="text-center mt-3">
            <Button className="btn-primary me-2" onClick={applyFilters}>
              Appliquer les filtres
            </Button>
            <Button className="btn-secondary" onClick={handleResetFilters}>
              Réinitialiser les filtres
            </Button>
          </Col>
        </Row>
      </div>

      <div className="container text-light">
        <h2 className="text-center text-primary mb-4">🎲 Jeux disponibles</h2>
        {loading ? (
          <p className="text-center">Chargement des jeux...</p>
        ) : (
          <>
            <Row className="justify-content-center">
              {games.map((game) => (
                <Col key={game.id} md={4} sm={6} lg={2} className="mb-4 fadeInUp">
                  <GameCard game={game} />
                </Col>
              ))}
            </Row>

            <div className="text-center mt-4">
              <Button
                variant="secondary"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="me-2"
              >
                ⬅ Précédent
              </Button>
              <span className="text-light">{page} / {totalPages}</span>
              <Button
                variant="secondary"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="ms-2"
              >
                Suivant ➡
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Games;
