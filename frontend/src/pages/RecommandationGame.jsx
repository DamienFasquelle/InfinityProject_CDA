import React, { useEffect, useState } from "react";
import { Row, Col, Spinner, Alert, Container } from "react-bootstrap";
import GameCard from "../components/GameCard";
import { searchGames } from "../services/rawgService";

const RecommandationGame = ({ games }) => {
  const [detailedGames, setDetailedGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const gameDetails = await Promise.all(
          games.map(async (game) => {
            const results = await searchGames(game.title);
            return results?.results?.[0] || null;
          })
        );
        setDetailedGames(gameDetails.filter((game) => game !== null));
      } catch (err) {
        setError("❌ Une erreur est survenue lors de la récupération des jeux.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (games.length > 0) {
      fetchGameDetails();
    }
  }, [games]);

  return (
    <main className="py-4">
      <Container fluid="sm">
        <section className="text-center mb-4">
          <h2 className="mb-3 fw-bold" style={{ color: "var(--primary)" }}>
            🎮 Jeux Recommandés
          </h2>

          {loading && (
            <div className="my-5 text-center">
              <Spinner animation="border" variant="info" />
              <p className="mt-3">Chargement des jeux en cours...</p>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {!loading && detailedGames.length === 0 && (
            <p className="mt-4 text-white">
              Les jeux recommandés par le chatbot seront affichés ici.
            </p>
          )}

          <Row className="g-3 justify-content-center">
            {detailedGames.map((game, index) => (
              <Col
                key={game.id}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className="animated-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <GameCard game={game} />
              </Col>
            ))}
          </Row>
        </section>
      </Container>
    </main>
  );
};

export default RecommandationGame;
