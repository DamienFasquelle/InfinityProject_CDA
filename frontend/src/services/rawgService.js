import axios from 'axios';

const API_KEY = process.env.REACT_APP_API_KEY;
const BASE_URL = process.env.REACT_APP_BASE_URL;


/**
 * Fetch des jeux sur plusieurs pages.
 * @param {number} totalPages - Nombre de pages à charger.
 * @returns {Promise<Array>} Les données des jeux provenant de plusieurs pages.
 */
export const fetchGames = async (totalPages = 4) => {
    let allGames = [];
  
    
    for (let page = 1; page <= totalPages; page++) {
      const url = `${BASE_URL}/games?key=${API_KEY}&page=${page}`;
      try {
        const response = await axios.get(url);
  
       
        if (response.data && response.data.results) {
          allGames = [...allGames, ...response.data.results];
        } else {
          console.warn(`Aucun jeu trouvé à la page ${page}`);
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération des jeux à la page ${page}:`, error);
      }
    } 
    return allGames;
  };
  
/**
 * Fetch des jeux populaires.
 * @param {string} dates - Plage de dates au format YYYY-MM-DD,YYYY-MM-DD.
 * @param {string} platforms - Identifiants des plateformes séparés par des virgules.
 * @returns {Promise<Object>} Les données des jeux populaires.
 */
export const fetchPopularGames = async (dates = '2023-01-01', platforms = '18,1,7') => {
    const url = `${BASE_URL}/games?key=${API_KEY}&dates=${dates}&platforms=${platforms}`;
    const response = await axios.get(url);
    return response.data;
  };

  /**
 * Fetch des jeux les plus récents (après une certaine date).
 * @param {string} date - Date de lancement minimum au format YYYY-MM-DD.
 * @returns {Promise<Array>} Les jeux les plus récents après la date spécifiée.
 */
export const fetchRecentGames = async (date = '2024-01-01') => {
  const url = `${BASE_URL}/games?key=${API_KEY}&dates=${date},2025-01-01`; // Recherche les jeux après cette date
  try {
    const response = await axios.get(url);
    return response.data.results; // On retourne seulement les jeux
  } catch (error) {
    console.error("Erreur lors de la récupération des jeux récents :", error);
    return [];
  }
};

  
  /**
   * Fetch des plateformes disponibles.
   * @returns {Promise<Object>} Les données des plateformes.
   */
  export const fetchPlatforms = async () => {
    const url = `${BASE_URL}/platforms?key=${API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  };
  
  /**
   * Fetch des détails d'un jeu spécifique.
   * @param {number|string} gameId - Identifiant du jeu.
   * @returns {Promise<Object>} Les détails du jeu.
   */
  export const fetchGameDetails = async (gameId) => {
    const url = `${BASE_URL}/games/${gameId}?key=${API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  };
  
  /**
   * Fetch des screenshots d'un jeu spécifique.
   * @param {number|string} gameId - Identifiant du jeu.
   * @returns {Promise<Object>} Les screenshots du jeu.
   */
  export const fetchGameScreenshots = async (gameId) => {
    const url = `${BASE_URL}/games/${gameId}/screenshots?key=${API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  };
  
  /**
   * Fetch des genres disponibles.
   * @returns {Promise<Object>} Les genres de jeux.
   */
  export const fetchGenres = async () => {
    const url = `${BASE_URL}/genres?key=${API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  };

   /**
   * Fetch des tags disponibles.
   * @returns {Promise<Object>} Les genres de jeux.
   */
   export const fetchTags = async () => {
    const url = `${BASE_URL}/tags?key=${API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  };

   /**
   * Fetch des développeurs disponibles.
   * @returns {Promise<Object>} Les genres de jeux.
   */
   export const fetchDevelopers = async () => {
    const url = `${BASE_URL}/developers?key=${API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  };
  
  /**
   * Fetch des créateurs de contenu (exemple : développeurs, éditeurs).
   * @returns {Promise<Object>} Les créateurs de contenu.
   */
  export const fetchCreators = async () => {
    const url = `${BASE_URL}/creators?key=${API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  };
  
  /**
   * Recherche de jeux par nom.
   * @param {string} query - Terme de recherche.
   * @returns {Promise<Object>} Les résultats de recherche.
   */
  export const searchGames = async (query) => {
    const url = `${BASE_URL}/games?key=${API_KEY}&search=${query}&exact=true`;
    const response = await axios.get(url);
    return response.data;
  };
  
  /**
   * Fetch des stores (magasins où les jeux sont vendus).
   * @returns {Promise<Object>} Les données des stores.
   */
  export const fetchStores = async () => {
    const url = `${BASE_URL}/stores?key=${API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  };

  /**
 * Fetch des vidéos d'un jeu spécifique.
 * @param {number|string} gameId - Identifiant du jeu.
 * @returns {Promise<Object>} Les vidéos du jeu.
 */
export const fetchGameVideos = async (gameId) => {
  const url = `${BASE_URL}/games/${gameId}/movies?key=${API_KEY}`;
  const response = await axios.get(url);
  return response.data;
};

/**
 * Fetch des jeux similaires basés sur tous les genres du jeu de base (inclus dans les genres des jeux similaires)
 * et au moins 5 tags communs. Exclut le jeu lui-même.
 * @param {number|string} currentGameId - Identifiant du jeu actuel.
 * @param {Array} genres - Liste des genres du jeu de base.
 * @param {Array} tags - Liste des tags du jeu de base.
 * @returns {Promise<Object[]>} Les jeux similaires.
 */
export const fetchSimilarGames = async (currentGameId, genres, tags) => {
  try {
    // Récupérer les IDs des genres
    const genreIds = genres.map((genre) => genre.id).join(",");
    const tagIds = tags.map((tag) => tag.id).join(",");

    // Appel API pour obtenir des jeux filtrés par genres et tags
    const url = `${BASE_URL}/games?key=${API_KEY}&genres=${genreIds}&tags=${tagIds}&page_size=50`;
    const response = await axios.get(url);

    // Filtrer les jeux pour inclure uniquement ceux qui ont :
    // 1. Tous les genres du jeu de base (inclus dans leurs genres)
    // 2. Au moins 5 tags communs
    // 3. Exclure le jeu lui-même
    const similarGames = (response.data.results || []).filter((game) => {
      const gameGenreIds = game.genres.map((genre) => genre.id);
      const gameTagIds = game.tags.map((tag) => tag.id);

      // Vérifie que tous les genres du jeu de base sont inclus dans les genres du jeu similaire
      const hasAllGenres = genres.every((genre) => gameGenreIds.includes(genre.id));

      // Vérifie qu'il y a au moins 5 tags communs
      const commonTags = tags.filter((tag) => gameTagIds.includes(tag.id));
      const hasEnoughTags = commonTags.length >= 5;

      const isNotCurrentGame = game.id !== currentGameId;

      return hasAllGenres && hasEnoughTags && isNotCurrentGame;
    });

    return similarGames;
  } catch (error) {
    console.error("Erreur lors de la récupération des jeux similaires :", error);
    return [];
  }
};


/**
 * Fetch des séries de jeux d'un jeu spécifique.
 * @param {number|string} gameId - Identifiant du jeu.
 * @returns {Promise<Object>} Les séries de jeux du jeu spécifié.
 */
export const fetchGameSeries = async (gameId) => {
  const url = `${BASE_URL}/games/${gameId}/game-series?key=${API_KEY}`;
  try {
    const response = await axios.get(url);
    return response.data; // Retourne les données obtenues
  } catch (error) {
    console.error(`Erreur lors de la récupération des séries de jeux pour le jeu ${gameId}:`, error);
    return {}; // Retourne un objet vide en cas d'erreur
  }
};


