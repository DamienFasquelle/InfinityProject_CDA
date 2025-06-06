const API_URL = process.env.REACT_APP_API_URL;

export const fetchGenres = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/genres/list`);
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des genres');
  }
  return response.json();
};


export async function fetchAllTopics() {
  const res = await fetch(`${API_URL}/api/topic/list`);
  if (!res.ok) throw new Error('Échec du chargement des topics');
  return await res.json();
}

export async function createTopic(topicData) {
  const token = localStorage.getItem('token');

  const formData = new FormData();
  formData.append('title', topicData.title);
  formData.append('genre_id', topicData.genre || '');
  formData.append('description', topicData.description || '');
  if (topicData.image) {
    formData.append('image', topicData.image);
  }

  const res = await fetch(`${API_URL}/api/topic/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
console.log( formData)
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.error || 'Échec de la création du topic'
    );
  }

  return await res.json();
}

export const fetchTopicById = async (id) => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/topic/${id}`);
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Erreur lors du chargement du topic');
  }
  return res.json();
};

