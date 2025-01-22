import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
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
        setError("Une erreur est survenue lors de la récupération des détails des jeux.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (games.length > 0) {
      fetchGameDetails();
    }
  }, [games]);

  if (loading) {
    return <div>Chargement des jeux...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }
  console.log(detailedGames);

  return (
    <div>
      <h2>Jeux Recommandés</h2>
      <Row className="justify-content-center">
        {detailedGames.length > 0 ? (
          detailedGames.map((game) => (
            <Col key={game.id} md={4} sm={6} lg={2} className="mb-4">
              <GameCard game={game} />
            </Col>
          ))
        ) : (
          <div>Aucune recommandation disponible.</div>
        )}
      </Row>
    </div>
  );
};

export default RecommandationGame;
