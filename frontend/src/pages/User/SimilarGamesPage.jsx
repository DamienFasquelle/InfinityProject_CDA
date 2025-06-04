import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Button, Form } from 'react-bootstrap';
import GameCard from '../../components/GameCard';
import {
  fetchGameDetails,
  fetchSimilarGames,
  fetchGameSeries,
} from '../../services/rawgService';

const SIMILAR_PAGE_SIZE = 6;
const SERIES_PAGE_SIZE = 6;

const SimilarGamesPage = () => {
  const [favoriteGameIds, setFavoriteGameIds] = useState([]);
  const [favoriteGames, setFavoriteGames] = useState([]); // {id, name}
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedGameTitle, setSelectedGameTitle] = useState('');
  const [similarGames, setSimilarGames] = useState([]);
  const [seriesGames, setSeriesGames] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [loadingSeries, setLoadingSeries] = useState(false);

  const [currentSimilarPage, setCurrentSimilarPage] = useState(1);
  const [currentSeriesPage, setCurrentSeriesPage] = useState(1);

  // Fetch favorites IDs
  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('Utilisateur non authentifié');
      setLoadingFavorites(false);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const res = await fetch(`${API_URL}/api/favorite/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFavoriteGameIds(data);
      } catch (error) {
        console.error('Erreur lors du chargement des favoris :', error);
      }
    };

    fetchFavorites();
  }, []);

  // Dès qu'on a les IDs, on récupère les détails (titre) pour la dropdown
  useEffect(() => {
    if (favoriteGameIds.length === 0) {
      setLoadingFavorites(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const detailsPromises = favoriteGameIds.map((id) => fetchGameDetails(id));
        const details = await Promise.all(detailsPromises);
        setFavoriteGames(details.map(({ id, name }) => ({ id, name })));
        setLoadingFavorites(false);
        if (details.length > 0) {
          selectGame(details[0].id, details[0].name);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails favoris :', error);
        setLoadingFavorites(false);
      }
    };

    fetchDetails();
  }, [favoriteGameIds]);

  const selectGame = async (gameId, gameTitle = '') => {
  setSelectedGameId(gameId);
  setSelectedGameTitle(gameTitle);
  setLoadingSimilar(true);
  setLoadingSeries(true);
  setSimilarGames([]);
  setSeriesGames([]);
  setCurrentSimilarPage(1);
  setCurrentSeriesPage(1);

  try {
    let title = gameTitle;
    if (!title) {
      const game = await fetchGameDetails(gameId);
      if (!game) throw new Error('Détails du jeu non trouvés');
      title = game.name;
      setSelectedGameTitle(title);
    }

    const gameDetails = await fetchGameDetails(gameId);
    if (!gameDetails) throw new Error('Détails du jeu non trouvés');
    const genres = gameDetails.genres || [];
    const tags = gameDetails.tags || [];
    const similars = await fetchSimilarGames(gameId, genres, tags);
    setSimilarGames(similars || []);

    const seriesData = await fetchGameSeries(gameId);
    setSeriesGames(seriesData?.results || []);
  } catch (error) {
    console.error('Erreur lors du chargement des jeux similaires ou de la série:', error);
    setSimilarGames([]);
    setSeriesGames([]);
  } finally {
    setLoadingSimilar(false);
    setLoadingSeries(false);
  }
};


  const totalSimilarPages = Math.ceil(similarGames.length / SIMILAR_PAGE_SIZE);
  const startSimilarIndex = (currentSimilarPage - 1) * SIMILAR_PAGE_SIZE;
  const paginatedSimilarGames = similarGames.slice(
    startSimilarIndex,
    startSimilarIndex + SIMILAR_PAGE_SIZE
  );

  const totalSeriesPages = Math.ceil(seriesGames.length / SERIES_PAGE_SIZE);
  const startSeriesIndex = (currentSeriesPage - 1) * SERIES_PAGE_SIZE;
  const paginatedSeriesGames = seriesGames.slice(
    startSeriesIndex,
    startSeriesIndex + SERIES_PAGE_SIZE
  );

  if (loadingFavorites) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-2">Chargement de vos jeux favoris...</p>
      </div>
    );
  }

  if (favoriteGames.length === 0) {
    return <p className="text-center mt-5">Vous n'avez pas encore de jeux favoris.</p>;
  }

  return (
    <Row className="m-4" style={{ minHeight: '80vh' }}>
      {/* Colonne gauche : dropdown sélection jeux favoris */}
      <Col xs={12} md={4} className="mb-4">
        <h2 className="mb-3 text-primary">🎮 Vos jeux favoris</h2>
        <Form.Select
          value={selectedGameId || ''}
          onChange={(e) => {
            const id = parseInt(e.target.value, 10);
            const game = favoriteGames.find((g) => g.id === id);
            selectGame(id, game?.name || '');
          }}
        >
          {favoriteGames.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </Form.Select>
      </Col>

      {/* Colonne droite : jeux similaires & série */}
      <Col xs={12} md={8}>
        {/* Jeux similaires */}
        <section className="mb-5">
          <h3 className="mb-3 text-white">
            Voici des jeux similaires à <strong>{selectedGameTitle}</strong>
          </h3>

          {loadingSimilar ? (
            <div className="text-center mt-3">
              <Spinner animation="border" />
              <p>Chargement des jeux similaires...</p>
            </div>
          ) : paginatedSimilarGames.length > 0 ? (
            <>
              <Row className="g-4">
                {paginatedSimilarGames.map((game) => (
                  <Col key={game.id} xs={12} sm={6} md={4} lg={4}>
                    <GameCard game={game} />
                  </Col>
                ))}
              </Row>

              {totalSimilarPages > 1 && (
                <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
                  <Button
                    variant="outline-light"
                    disabled={currentSimilarPage === 1}
                    onClick={() => setCurrentSimilarPage((p) => Math.max(p - 1, 1))}
                  >
                    Précédent
                  </Button>
                  <span className="text-white">
                    Page {currentSimilarPage} / {totalSimilarPages}
                  </span>
                  <Button
                    variant="outline-light"
                    disabled={currentSimilarPage === totalSimilarPages}
                    onClick={() => setCurrentSimilarPage((p) => Math.min(p + 1, totalSimilarPages))}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-white">Aucun jeu similaire trouvé.</p>
          )}
        </section>

        {/* Jeux de la même série */}
        <section>
          <h3 className="mb-3 text-white">Autres jeux de la même série :</h3>

          {loadingSeries ? (
            <div className="text-center mt-3">
              <Spinner animation="border" />
              <p>Chargement des jeux de la série...</p>
            </div>
          ) : paginatedSeriesGames.length > 0 ? (
            <>
              <Row className="g-4">
                {paginatedSeriesGames.map((game) => (
                  <Col key={game.id} xs={12} sm={6} md={4} lg={4}>
                    <GameCard game={game} />
                  </Col>
                ))}
              </Row>

              {totalSeriesPages > 1 && (
                <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
                  <Button
                    variant="outline-light"
                    disabled={currentSeriesPage === 1}
                    onClick={() => setCurrentSeriesPage((p) => Math.max(p - 1, 1))}
                  >
                    Précédent
                  </Button>
                  <span className="text-white">
                    Page {currentSeriesPage} / {totalSeriesPages}
                  </span>
                  <Button
                    variant="outline-light"
                    disabled={currentSeriesPage === totalSeriesPages}
                    onClick={() =>
                      setCurrentSeriesPage((p) => Math.min(p + 1, totalSeriesPages))
                    }
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-white">Aucun autre jeu dans cette série.</p>
          )}
        </section>
      </Col>
    </Row>
  );
};

export default SimilarGamesPage;
