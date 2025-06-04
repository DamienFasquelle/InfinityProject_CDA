const API_URL = process.env.REACT_APP_API_URL;


export async function fetchAllTopics() {
  const res = await fetch(`${API_URL}/api/topic/list`);
  if (!res.ok) throw new Error('Échec du chargement des topics');
  return await res.json();
}

export async function createTopic(topicData) {
  const token = localStorage.getItem('token'); // Récupération du token d'auth
  const res = await fetch(`${API_URL}/api/topic/create`, {  // /api/topic/create comme dans ton backend
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: topicData.title, // Ton backend attend uniquement le titre
    }),
  });
  if (!res.ok) {
    // Pour gérer les erreurs, on peut essayer de récupérer le message retourné par l'API
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.error || 'Échec de la création du topic'
    );
  }
  return await res.json();
}