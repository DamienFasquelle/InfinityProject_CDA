import React, { useEffect, useState } from "react";
import { Row, Col, Spinner, Alert } from "react-bootstrap";
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
        setError(
          "❌ Une erreur est survenue lors de la récupération des jeux."
        );
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
    <main className="container">
      <section className="intro text-center my-2">
        <div className="recommendation-container fadeInUp">
          <h2 className="recommendation-title">🎮 Jeux Recommandés</h2>

          {loading && (
            <div className="text-center my-5">
              <Spinner animation="border" variant="info" />
              <p className="mt-3">Chargement des jeux en cours...</p>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="justify-content-center">
            {detailedGames.length > 0
              ? detailedGames.map((game, index) => (
                  <Col
                    key={game.id}
                    md={4}
                    sm={6}
                    lg={3}
                    className="mb-4 animated-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <GameCard game={game} />
                  </Col>
                ))
              : !loading && (
                  <div className="no-recommendation text-center mt-4">
                    <p>
                      Les jeux recommandés par le chatbot seront affichés ici.
                    </p>
                  </div>
                )}
          </Row>
        </div>
      </section>
    </main>
  );
};

export default RecommandationGame;
