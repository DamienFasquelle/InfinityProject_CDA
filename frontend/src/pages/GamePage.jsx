import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchGameDetails,
  fetchGameScreenshots,
  fetchDevelopers,
  fetchCreators,
  fetchStores,
  fetchGameVideos,
  fetchSimilarGames,
  fetchGameSeries,
} from "../services/rawgService";
import { Button, Col, Form, Row } from "react-bootstrap";
import GameCard from "../components/GameCard";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../providers/AuthProvider";

const GamePage = () => {
  const { id } = useParams();
  const [gameDetails, setGameDetails] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [creators, setCreators] = useState([]);
  const [stores, setStores] = useState([]);
  const [videos, setVideos] = useState([]);
  const [similarGames, setSimilarGames] = useState([]);
  const [gamesSeries, setGamesSeries] = useState([]);
  const [comments, setComments] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [editedRating, setEditedRating] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isConnected, setIsConnected] = useState(false);
    const { isAdmin } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }

    const fetchDetails = async () => {
      try {
        const data = await fetchGameDetails(id);
        setGameDetails(data);
        const screenshotData = await fetchGameScreenshots(id);
        setScreenshots(screenshotData.results || []);
        const developersData = await fetchDevelopers();
        setDevelopers(developersData.results || []);
        const creatorsData = await fetchCreators();
        setCreators(creatorsData.results || []);
        const storesData = await fetchStores();
        setStores(storesData.results || []);
        const videoData = await fetchGameVideos(id);
        setVideos(videoData.results || []);
        const gameSeriesData = await fetchGameSeries(id);
        setGamesSeries(gameSeriesData.results || []);
        if (data.genres && data.tags) {
          const similarGamesData = await fetchSimilarGames(id, data.genres, data.tags);
          setSimilarGames(similarGamesData);
        }
        const commentResponse = await fetch(`http://127.0.0.1:8000/comments/${id}`);
        const commentData = await commentResponse.json();
        setComments(commentData);
      } catch (error) {
        console.error("Erreur lors du chargement des données du jeu", error);
      }
    };

    fetchDetails();
  }, [id]);

  const handleNewCommentSubmit = async (e) => {
    const token = localStorage.getItem("token");
    e.preventDefault();
    if (!token) {
      setError("Vous devez être connecté pour publier un commentaire.");
      return;
    }
    const decodedToken = jwtDecode(token);
    const userRoles = decodedToken.roles || [];
    const isUserRole = userRoles.includes("ROLE_USER");

    if (!isUserRole) {
      setError("Vous devez être un utilisateur pour publier un commentaire.");
      return;
    }

    const commentData = {
      content: newComment,
      rating: newRating,
      gameId: id,
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(commentData),
      });

      if (response.status === 201) {
        setNewComment("");
        setNewRating(1);
        setSuccess("Commentaire ajouté avec succès.");
        window.location.reload();
      }
    } catch (err) {
      setError("Une erreur s'est produite.");
      console.error("Erreur de requête :", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/comment/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire", error);
    }
  };

  const handleEditComment = async (commentId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/comment/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editedComment,
          rating: editedRating,
          gameId: id,
        }),
      });
      if (response.status === 200) {
        setIsEditing(null);
        setEditedComment("");
        setEditedRating(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Erreur lors de la modification du commentaire", error);
    }
  };

  const startEditing = (commentId, content, rating) => {
    setIsEditing(commentId);
    setEditedComment(content);
    setEditedRating(rating);
  };

  if (!gameDetails)
    return <div className="game-page-container">Chargement...</div>;

  return (
    <div className="game-page-container">
      <div
        className="game-header"
        style={{
          backgroundImage: `url(${gameDetails.background_image})`,
        }}
      >
        <div className="game-title">
          <h1>{gameDetails.name}</h1>
          <p>{gameDetails.released || "Non spécifié"}</p>
        </div>
      </div>

      <div className="game-content">
        <div className="game-info">
          {/* Description */}
          <section className="my-4">
            <h2>Description</h2>
            <p>{gameDetails.description_raw || "Non spécifié"}</p>
          </section>

          <section className="my-4">
            <h2>Jeux Similaires par Nom</h2>
            {gamesSeries.length > 0 ? (
              <div className="similar-name-games">
                <Row className="justify-content-center">
                  {gamesSeries.map((game) => (
                    <Col key={game.id} md={4} sm={6} lg={3} className="mb-4">
                      <GameCard game={game} />
                    </Col>
                  ))}
                </Row>
              </div>
            ) : (
              <p>Aucun jeu similaire trouvé par nom.</p>
            )}
          </section>

          {/* Genres */}
          <section className="my-4">
            <h2>Genres</h2>
            {gameDetails.genres && gameDetails.genres.length > 0 ? (
              <div className="genres">
                {gameDetails.genres.map((genre) => (
                  <span key={genre.id} className="genre">
                    {genre.name}
                  </span>
                ))}
              </div>
            ) : (
              <p>Non spécifié</p>
            )}
          </section>

          {/* Tags */}
          <section className="my-4">
            <h2>Tags</h2>
            {gameDetails.tags && gameDetails.tags.length > 0 ? (
              <div className="tags">
                {gameDetails.tags.map((tag) => (
                  <span key={tag.id} className="tag">
                    {tag.name}
                  </span>
                ))}
              </div>
            ) : (
              <p>Non spécifié</p>
            )}
          </section>

          {/* Développeurs, Créateurs et Magasins */}
          <section className="my-4">
            <Row>
              {/* Développeurs */}
              <Col md={4}>
                <h2>Développeurs</h2>
                {developers.length > 0 ? (
                  <ul>
                    {developers.map((dev) => (
                      <li key={dev.id}>{dev.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Non spécifié</p>
                )}
              </Col>

              {/* Créateurs */}
              <Col md={4}>
                <h2>Créateurs</h2>
                {creators.length > 0 ? (
                  <ul>
                    {creators.map((creator) => (
                      <li key={creator.id}>{creator.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Non spécifié</p>
                )}
              </Col>

              {/* Magasins */}
              <Col md={4}>
                <h2>Magasins</h2>
                {stores.length > 0 ? (
                  <ul>
                    {stores.map((store) => (
                      <li key={store.id}>
                        <a
                          href={store.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {store.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Non spécifié</p>
                )}
              </Col>
            </Row>
          </section>

          {/* Captures d'écran */}
          <section>
            <h2>Captures d'écran</h2>
            {screenshots.length > 0 ? (
              <div className="game-screenshots">
                <Row>
                  {screenshots.map((screenshot, index) => (
                    <Col key={index} sm={6} md={4} lg={3} className="mb-4">
                      <img
                        src={screenshot.image}
                        alt={`Screenshot ${index + 1}`}
                        className="screenshot img-fluid"
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            ) : (
              <p>Non spécifié</p>
            )}
          </section>

          {/* Vidéos */}
          <section>
            <h2>Vidéos</h2>
            {videos.length > 0 ? (
              <div className="game-videos">
                <Row>
                  {videos.map((video, index) => {
                    const videoUrl = video.data.max || video.data["480"];
                    return (
                      <Col
                        key={index}
                        sm={6}
                        md={4}
                        lg={3}
                        className="mb-4"
                      >
                        {videoUrl ? (
                          <div className="video">
                            <h3>{video.name}</h3>
                            <video width="100%" height="auto" controls>
                              <source src={videoUrl} type="video/mp4" />
                              Votre navigateur ne supporte pas la lecture de cette vidéo.
                            </video>
                          </div>
                        ) : (
                          <p>La vidéo n'est pas disponible.</p>
                        )}
                      </Col>
                    );
                  })}
                </Row>
              </div>
            ) : (
              <p>Aucune vidéo disponible.</p>
            )}
          </section>

          {/* Commentaires */}
          <section className="my-4">
            <h2>Commentaires</h2>
            {comments.length > 0 ? (
              <div className="comments-list">
                {comments.map((comment) => {
                  const token = localStorage.getItem('token');
                  const decodedToken = token ? jwtDecode(token) : null;
                  const userId = decodedToken?.userId;
                  const isAdmin = decodedToken?.roles?.includes('ROLE_ADMIN');
                  return (
                    <div key={comment.id} className="comment">
                      {isEditing === comment.id ? (
                        <div>
                          <textarea
                            value={editedComment}
                            onChange={(e) => setEditedComment(e.target.value)}
                          />
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={editedRating}
                            onChange={(e) =>
                              setEditedRating(Number(e.target.value))
                            }
                          />
                          <button
                            onClick={() => handleEditComment(comment.id)}
                            className="btn-gradient"
                          >
                            Enregistrer
                          </button>
                          <button
                            onClick={() => setIsEditing(null)}
                            className="btn-danger"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p>
                            <strong>{comment.user}</strong> - {comment.created_at}
                          </p>
                          <p>{comment.content}</p>
                          <p>Note: {comment.rating} / 5</p>
                          {(comment.userId === userId || isAdmin) && (
                            <div>
                              <button
                                onClick={() =>
                                  startEditing(comment.id, comment.content, comment.rating)
                                }
                                className="btn-gradient"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="btn-danger"
                              >
                                Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>Aucun commentaire pour ce jeu.</p>
            )}
          </section>

          {isConnected && !isAdmin && (
            <section className="my-4">
              <h3>Ajouter un Commentaire</h3>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <Form onSubmit={handleNewCommentSubmit}>
                <Form.Group controlId="content">
                  <Form.Label>Votre Commentaire</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="rating">
                  <Form.Label>Note (1 à 5)</Form.Label>
                  <Form.Control
                    as="select"
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    required
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Button type="submit">Soumettre</Button>
              </Form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePage;
