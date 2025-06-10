import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Button, Form } from 'react-bootstrap';
import { FaGamepad, FaSyncAlt, FaPuzzlePiece } from 'react-icons/fa';
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
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedGameTitle, setSelectedGameTitle] = useState('');
  const [similarGames, setSimilarGames] = useState([]);
  const [seriesGames, setSeriesGames] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [currentSimilarPage, setCurrentSimilarPage] = useState(1);
  const [currentSeriesPage, setCurrentSeriesPage] = useState(1);

  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem('token');
    if (!token) {
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
        console.error('Erreur chargement favoris:', error);
      }
    };
    fetchFavorites();
  }, []);

  useEffect(() => {
    if (favoriteGameIds.length === 0) {
      setLoadingFavorites(false);
      return;
    }
    const fetchDetails = async () => {
      try {
        const details = await Promise.all(favoriteGameIds.map(fetchGameDetails));
        setFavoriteGames(details.map(({ id, name }) => ({ id, name })));
        setLoadingFavorites(false);
        if (details.length > 0) {
          selectGame(details[0].id, details[0].name);
        }
      } catch (error) {
        console.error('Erreur détails favoris:', error);
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
      if (!gameTitle) {
        const game = await fetchGameDetails(gameId);
        gameTitle = game.name;
        setSelectedGameTitle(gameTitle);
      }
      const details = await fetchGameDetails(gameId);
      const similars = await fetchSimilarGames(gameId, details.genres || [], details.tags || []);
      const series = await fetchGameSeries(gameId);
      setSimilarGames(similars || []);
      setSeriesGames(series?.results || []);
    } catch (error) {
      console.error('Erreur chargement similaires/série:', error);
    } finally {
      setLoadingSimilar(false);
      setLoadingSeries(false);
    }
  };

  const paginated = (games, page, size) =>
    games.slice((page - 1) * size, page * size);

  const loader = (text) => (
    <div className="text-center mt-3">
      <Spinner animation="border" variant="light" />
      <p className="text-white mt-2">{text}</p>
    </div>
  );

  if (loadingFavorites) return loader("Chargement de vos jeux favoris...");

  if (favoriteGames.length === 0)
    return <p className="text-center mt-5 text-white">Vous n'avez pas encore de jeux favoris.</p>;

  return (
    <Row className="m-4 text-white">
      {/* Sélecteur de jeu favori */}
      <Col xs={12} md={4} className="mb-4">
        <h4 className="mb-3 text-primary"><FaGamepad className="me-2" />Vos jeux favoris</h4>
        <Form.Select
          value={selectedGameId || ''}
          onChange={(e) => {
            const id = parseInt(e.target.value, 10);
            const game = favoriteGames.find((g) => g.id === id);
            selectGame(id, game?.name);
          }}
        >
          {favoriteGames.map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </Form.Select>
      </Col>

      {/* Résultats */}
      <Col xs={12} md={8}>
        {/* Similaires */}
        <section className="mb-5">
          <h5 className="mb-3"><FaSyncAlt className="me-2" />Jeux similaires à <strong>{selectedGameTitle}</strong></h5>
          {loadingSimilar ? loader("Chargement des jeux similaires...") : (
            <>
              {paginated(similarGames, currentSimilarPage, SIMILAR_PAGE_SIZE).length > 0 ? (
                <>
                  <Row className="g-4">
                    {paginated(similarGames, currentSimilarPage, SIMILAR_PAGE_SIZE).map(game => (
                      <Col key={game.id} xs={12} sm={6} md={4}><GameCard game={game} /></Col>
                    ))}
                  </Row>
                  <PaginationControls
                    currentPage={currentSimilarPage}
                    totalPages={Math.ceil(similarGames.length / SIMILAR_PAGE_SIZE)}
                    onChange={setCurrentSimilarPage}
                  />
                </>
              ) : <p>Aucun jeu similaire trouvé.</p>}
            </>
          )}
        </section>

        {/* Série */}
        <section>
          <h5 className="mb-3"><FaPuzzlePiece className="me-2" />Autres jeux de la même série</h5>
          {loadingSeries ? loader("Chargement de la série...") : (
            <>
              {paginated(seriesGames, currentSeriesPage, SERIES_PAGE_SIZE).length > 0 ? (
                <>
                  <Row className="g-4">
                    {paginated(seriesGames, currentSeriesPage, SERIES_PAGE_SIZE).map(game => (
                      <Col key={game.id} xs={12} sm={6} md={4}><GameCard game={game} /></Col>
                    ))}
                  </Row>
                  <PaginationControls
                    currentPage={currentSeriesPage}
                    totalPages={Math.ceil(seriesGames.length / SERIES_PAGE_SIZE)}
                    onChange={setCurrentSeriesPage}
                  />
                </>
              ) : <p>Aucun autre jeu dans cette série.</p>}
            </>
          )}
        </section>
      </Col>
    </Row>
  );
};

// Pagination réutilisable
const PaginationControls = ({ currentPage, totalPages, onChange }) => (
  totalPages > 1 && (
    <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
      <Button variant="outline-light" disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>
        Précédent
      </Button>
      <span className="text-white">Page {currentPage} / {totalPages}</span>
      <Button variant="outline-light" disabled={currentPage === totalPages} onClick={() => onChange(currentPage + 1)}>
        Suivant
      </Button>
    </div>
  )
);

export default SimilarGamesPage;
