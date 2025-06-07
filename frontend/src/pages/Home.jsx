import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import GameCard from '../components/GameCard';
import { fetchRecentGames, fetchPopularGames } from '../services/rawgService';

const Home = () => {
  const recentRef = useRef(null);
  const popularRef = useRef(null);

  // 🔄 --- Récemment Sortis ---
  const [recentGames, setRecentGames] = useState([]);
  const [recentPage, setRecentPage] = useState(1);
  const [recentTotalPages, setRecentTotalPages] = useState(1);
  const [loadingRecent, setLoadingRecent] = useState(false);

  // 🌟 --- Populaires ---
  const [popularGames, setPopularGames] = useState([]);
  const [popularPage, setPopularPage] = useState(1);
  const [popularTotalPages, setPopularTotalPages] = useState(1);
  const [loadingPopular, setLoadingPopular] = useState(false);

  // 🔽 Scroll vers section
  const scrollToRef = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 🎮 Récupérer les jeux récents
  useEffect(() => {
    const loadRecent = async () => {
      setLoadingRecent(true);
      const data = await fetchRecentGames({
        dateFrom: '2023-01-01',
        page: recentPage,
        pageSize: 12,
      });

      if (data) {
        setRecentGames(data.results);
        setRecentTotalPages(Math.ceil(data.count / 12));
      }

      setLoadingRecent(false);
    };

    loadRecent();
  }, [recentPage]);

  // ⭐ Récupérer les jeux populaires
  useEffect(() => {
    const loadPopular = async () => {
      setLoadingPopular(true);
      const data = await fetchPopularGames({
        page: popularPage,
        pageSize: 12,
      });

      if (data) {
        setPopularGames(data.results);
        setPopularTotalPages(Math.ceil(data.count / 12));
      }

      setLoadingPopular(false);
    };

    loadPopular();
  }, [popularPage]);

  // === UI Pagination ===
  const Pagination = ({ page, totalPages, onPrev, onNext, loading }) => (
    <div className="text-center my-3">
      <Button
        variant="outline-light"
        disabled={page === 1 || loading}
        onClick={onPrev}
        className="me-2"
      >
        ⬅ Précédent
      </Button>
      <span>{page} / {totalPages}</span>
      <Button
        variant="outline-light"
        disabled={page === totalPages || loading}
        onClick={onNext}
        className="ms-2"
      >
        Suivant ➡
      </Button>
    </div>
  );

  return (
    <main>
    <Container className="my-5">
      {/* 🎮 Section Jeux Récents */}
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
      <section ref={recentRef}>
        <h2 className="mb-4">Jeux Récemment Sortis</h2>
        {loadingRecent ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="light" />
          </div>
        ) : (
          <>
            <Row>
              {recentGames.map((game) => (
                <Col key={game.id} lg={2} md={4} sm={6} className="mb-4">
                  <GameCard game={game} />
                </Col>
              ))}
            </Row>
            <Pagination
              page={recentPage}
              totalPages={recentTotalPages}
              onPrev={() => {
                setRecentPage((p) => p - 1);
                scrollToRef(recentRef);
              }}
              onNext={() => {
                setRecentPage((p) => p + 1);
                scrollToRef(recentRef);
              }}
              loading={loadingRecent}
            />
          </>
        )}
      </section>

      {/* ⭐ Section Jeux Populaires */}
      <section className="mt-5" ref={popularRef}>
        <h2 className="mb-4">Jeux Populaires</h2>
        {loadingPopular ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="light" />
          </div>
        ) : (
          <>
            <Row>
              {popularGames.map((game) => (
                <Col key={game.id} lg={2} md={4} sm={6} className="mb-4">
                  <GameCard game={game} />
                </Col>
              ))}
            </Row>
            <Pagination
              page={popularPage}
              totalPages={popularTotalPages}
              onPrev={() => {
                setPopularPage((p) => p - 1);
                scrollToRef(popularRef);
              }}
              onNext={() => {
                setPopularPage((p) => p + 1);
                scrollToRef(popularRef);
              }}
              loading={loadingPopular}
            />
          </>
        )}
      </section>
    </Container>
    </main>
  );
};

export default Home;
