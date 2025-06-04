import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { useGames } from '../providers/GameProvider';
import GameCard from '../components/GameCard';
import { fetchRecentGames } from '../services/rawgService';

const Home = () => {
  const { games, loading: loadingPopular } = useGames();
  const [recentGames, setRecentGames] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [recentPage, setRecentPage] = useState(1);
  const [recentTotalPages, setRecentTotalPages] = useState(1);

  useEffect(() => {
    const getRecentGames = async () => {
      setLoadingRecent(true);
      try {
        const result = await fetchRecentGames({
          dateFrom: '2023-01-01',
          page: recentPage,
          pageSize: 12,
        });
        setRecentGames(result.results);
        setRecentTotalPages(Math.ceil(result.count / 12));
      } catch (error) {
        console.error("Erreur lors de la récupération des jeux récents", error);
      } finally {
        setLoadingRecent(false);
      }
    };

    getRecentGames();
  }, [recentPage]);

  const popularGames = Array.isArray(games)
    ? games.filter((game) => game.rating >= 4).slice(0, 12)
    : [];

  return (
    <main className="container">
      <section className="intro text-center my-2">
        <h1>Bienvenue sur Infinity Games</h1>
        <p className="intro-text">
          Découvrez les jeux vidéo les plus récents, explorez les classiques intemporels et plongez dans un monde de divertissement infini.
        </p>

        <Row as="section" className="info-blocks justify-content-center my-5" aria-label="Présentation des catégories">
          <Col as="article" lg={4} md={6} sm={12} className="info-block">
            <div className="info-card">
              <h3>Jeux Récents</h3>
              <p>Explorez les dernières sorties de jeux vidéo pour être toujours à jour.</p>
            </div>
          </Col>
          <Col as="article" lg={4} md={6} sm={12} className="info-block">
            <div className="info-card">
              <h3>Jeux Populaires</h3>
              <p>Découvrez les jeux les mieux notés et les plus aimés par la communauté.</p>
            </div>
          </Col>
          <Col as="article" lg={4} md={6} sm={12} className="info-block">
            <div className="info-card">
              <h3>Genres Variés</h3>
              <p>Parcourez une grande variété de genres pour trouver votre prochain coup de cœur.</p>
            </div>
          </Col>
        </Row>
      </section>

      {/* Jeux récents */}
      <section className="recent-games my-5" aria-labelledby="recent-title">
        <h2 id="recent-title">Jeux Récemment Sortis</h2>

        {loadingRecent ? (
          <p>Chargement des jeux récemment sortis...</p>
        ) : (
          <>
            <Row className="justify-content-center">
              {recentGames.map((game) => (
                <Col as="article" key={game.id} md={6} sm={12} lg={2} className="mb-4">
                  <GameCard game={game} />
                </Col>
              ))}
            </Row>

            <nav className="text-center mt-3" aria-label="Pagination des jeux récents">
              <Button
                onClick={() => setRecentPage((p) => Math.max(p - 1, 1))}
                disabled={recentPage === 1}
                className="me-2"
                variant="outline-light"
              >
                ⬅ Précédent
              </Button>
              <span className="text-light">
                {recentPage} / {recentTotalPages}
              </span>
              <Button
                onClick={() => setRecentPage((p) => Math.min(p + 1, recentTotalPages))}
                disabled={recentPage === recentTotalPages}
                className="ms-2"
                variant="outline-light"
              >
                Suivant ➡
              </Button>
            </nav>
          </>
        )}
      </section>

      {/* Jeux populaires */}
      <section className="popular-games my-5" aria-labelledby="popular-title">
        <h2 id="popular-title">Jeux Populaires</h2>

        {loadingPopular ? (
          <p>Chargement des jeux populaires...</p>
        ) : (
          <Row className="justify-content-center">
            {popularGames.map((game) => (
              <Col as="article" key={game.id} md={6} sm={12} lg={2} className="mb-4">
                <GameCard game={game} />
              </Col>
            ))}
          </Row>
        )}
      </section>
    </main>
  );
};

export default Home;
