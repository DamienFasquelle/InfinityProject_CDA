import React, { useState, useEffect } from 'react';
import { Button, Row, Form,  } from 'react-bootstrap';
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
    <main className="container">
      <section className="intro text-center my-2">
          <h1>Bibliothèque de jeux</h1>
        <p className="intro-text">
            Découvrez des milliers de jeux vidéo selon vos préférences. Utilisez les filtres ci-dessous pour affiner votre recherche.
          </p>
      </section>

      {/* Filtres + jeux */}
      <section className="container-fluid my-4">
        <Row>
          {/* Colonne filtres */}
          <aside className="col-md-3 mb-4 filter-game"  style={{ position: 'sticky', top: '80px', alignSelf: 'start' }}>
            <section className="p-4 bg-dark text-light rounded shadow">
              <h2 className="text-primary mb-4 text-center">Filtres</h2>
              <Form>
                <Form.Group className="mb-3" controlId="platform">
                  <Form.Label>Plateforme</Form.Label>
                  <Form.Select name="platform" value={pendingFilters.platform} onChange={handleFilterChange}>
                    <option value="">Toutes</option>
                    {platforms.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="genre">
                  <Form.Label>Genre</Form.Label>
                  <Form.Select name="genre" value={pendingFilters.genre} onChange={handleFilterChange}>
                    <option value="">Tous</option>
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="tag">
                  <Form.Label>Tag</Form.Label>
                  <Form.Select name="tag" value={pendingFilters.tag} onChange={handleFilterChange}>
                    <option value="">Tous</option>
                    {tags.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="rating">
                  <Form.Label>Évaluation</Form.Label>
                  <Form.Select name="rating" value={pendingFilters.rating} onChange={handleFilterChange}>
                    <option value="">Toutes</option>
                    <option value="4">4+</option>
                    <option value="3">3+</option>
                    <option value="2">2+</option>
                    <option value="1">1+</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-flex justify-content-center gap-2">
                  <Button className="btn-primary" onClick={applyFilters}>
                    Appliquer
                  </Button>
                  <Button className="btn-secondary" onClick={handleResetFilters}>
                    Réinitialiser
                  </Button>
                </div>
              </Form>
            </section>
          </aside>

          {/* Colonne jeux */}
          <section className="col-md-9 bg-dark text-light p-4 rounded shadow">
            <h2 className="text-primary mb-4 text-center">Jeux disponibles</h2>
            {loading ? (
              <p className="text-center">Chargement des jeux...</p>
            ) : (
              <Row>
                {games.map((game) => (
                  <article key={game.id} className="col-md-4 col-sm-6 col-lg-3 mb-4 fadeInUp">
                    <GameCard game={game} />
                  </article>
                ))}
              </Row>
            )}

            {/* Pagination */}
            {!loading && (
              <div className="text-center mt-3">
                <Button
                  variant="secondary"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="me-2"
                >
                  ⬅ Précédent
                </Button>
                <span>{page} / {totalPages}</span>
                <Button
                  variant="secondary"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="ms-2"
                >
                  Suivant ➡
                </Button>
              </div>
            )}
          </section>
        </Row>
      </section>
    </main>
  );
};

export default Games;
