const API_KEY = process.env.REACT_APP_API_KEY;
const BASE_URL = process.env.REACT_APP_BASE_URL;

const handleFetch = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors du fetch:", error);
    return null;
  }
};

export const fetchGames = async ({ page = 1, pageSize = 20, filters = {} }) => {
  const params = new URLSearchParams({
    key: API_KEY,
    page,
    page_size: pageSize,
  });

  if (filters.platform) params.append("platforms", filters.platform);
  if (filters.genre) params.append("genres", filters.genre);
  if (filters.tag) params.append("tags", filters.tag);
  if (filters.rating) params.append("metacritic", `${filters.rating},100`);

  const url = `${BASE_URL}/games?${params.toString()}`;
  return await handleFetch(url);
};

export const fetchPopularGames = async ({ page = 1, pageSize = 12 }) => {
  const params = new URLSearchParams({
    key: API_KEY,
    ordering: '-rating',
    page,
    page_size: pageSize,
  });

  const url = `${BASE_URL}/games?${params.toString()}`;
  return await handleFetch(url);
};


export const fetchRecentGames = async ({ dateFrom, page = 1, pageSize = 12 }) => {
  const params = new URLSearchParams({
    key: API_KEY,
    dates: `${dateFrom},${new Date().toISOString().split('T')[0]}`,
    ordering: '-released',
    page,
    page_size: pageSize,
  });

  const url = `${BASE_URL}/games?${params.toString()}`;
  return await handleFetch(url);
};


export const fetchPlatforms = async () => {
  const url = `${BASE_URL}/platforms?key=${API_KEY}`;
  return await handleFetch(url);
};

export const fetchGameDetails = async (gameId) => {
  const url = `${BASE_URL}/games/${gameId}?key=${API_KEY}`;
  return await handleFetch(url);
};

export const fetchGameScreenshots = async (gameId) => {
  const url = `${BASE_URL}/games/${gameId}/screenshots?key=${API_KEY}`;
  return await handleFetch(url);
};

export const fetchGenres = async () => {
  const url = `${BASE_URL}/genres?key=${API_KEY}`;
  return await handleFetch(url);
};

export const fetchTags = async () => {
  const url = `${BASE_URL}/tags?key=${API_KEY}`;
  return await handleFetch(url);
};

export const fetchDevelopers = async () => {
  const url = `${BASE_URL}/developers?key=${API_KEY}`;
  return await handleFetch(url);
};

export const fetchCreators = async () => {
  const url = `${BASE_URL}/creators?key=${API_KEY}`;
  return await handleFetch(url);
};

export const searchGames = async (query) => {
  const url = `${BASE_URL}/games?key=${API_KEY}&search=${query}&exact=true`;
  return await handleFetch(url);
};

export const fetchStores = async () => {
  const url = `${BASE_URL}/stores?key=${API_KEY}`;
  return await handleFetch(url);
};

export const fetchStoresID = async (gameid) => {
  const url = `${BASE_URL}/games/${gameid}/stores?key=${API_KEY}`;
  return await handleFetch(url);
};

export const fetchGameVideos = async (gameId) => {
  const url = `${BASE_URL}/games/${gameId}/movies?key=${API_KEY}`;
  return await handleFetch(url);
};

export const fetchSimilarGames = async (currentGameId, genres, tags) => {
  try {
    const genreIds = genres.map((genre) => genre.id).join(",");
    const tagIds = tags.map((tag) => tag.id).join(",");
    const url = `${BASE_URL}/games?key=${API_KEY}&genres=${genreIds}&tags=${tagIds}&page_size=1000`;

    const data = await handleFetch(url);
    const results = data?.results || [];

    return results.filter((game) => {
      const gameGenreIds = game.genres.map((genre) => genre.id);
      const gameTagIds = game.tags.map((tag) => tag.id);

      const hasAllGenres = genres.every((genre) => gameGenreIds.includes(genre.id));
      const commonTags = tags.filter((tag) => gameTagIds.includes(tag.id));
      const hasEnoughTags = commonTags.length >= 5;
      const isNotCurrentGame = game.id !== currentGameId;

      return hasAllGenres && hasEnoughTags && isNotCurrentGame;
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des jeux similaires :", error);
    return [];
  }
};

export const fetchGameSeries = async (gameId) => {
  const url = `${BASE_URL}/games/${gameId}/game-series?key=${API_KEY}`;
  const data = await handleFetch(url);
  return data || {};
};

export const fetchTopRatedGames = async () => {
  const url = `${BASE_URL}/games?key=${API_KEY}&ordering=-rating&page_size=12`;
  return await handleFetch(url);
};

