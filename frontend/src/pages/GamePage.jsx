import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Card, Badge, ListGroup, Image } from "react-bootstrap";
import {
  fetchGameDetails,
  fetchGameScreenshots,
  fetchGameVideos,
  fetchDevelopers,
  fetchCreators,
  fetchStores,
  fetchStoresID,
  fetchGameSeries
} from "../services/rawgService";
import Comments from "./Comments";
import { AuthContext } from "../providers/AuthProvider";
import GameCard from "../components/GameCard";

const GamePage = () => {
  const { id } = useParams();
  const { isConnected, isAdmin } = useContext(AuthContext);
  const [gameDetails, setGameDetails] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [videos, setVideos] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [creators, setCreators] = useState([]);
  const [gameSeries, setGameSeries] = useState([]);
  const [stores, setStores] = useState([]);
  const [storesID, setStoresID] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          gameRes,
          screenRes,
          videoRes,
          storesIDRes,
          devRes,
          creatorRes,
          storeRes,
          seriesRes,
        ] = await Promise.all([
          fetchGameDetails(id),
          fetchGameScreenshots(id),
          fetchGameVideos(id),
          fetchStoresID(id),
          fetchDevelopers(),
          fetchCreators(),
          fetchStores(),
          fetchGameSeries(id),
        ]);
        const API_URL = process.env.REACT_APP_API_URL;
        setGameDetails(gameRes);
        setScreenshots(screenRes?.results || []);
        setVideos(videoRes?.results || []);
        setStoresID(storesIDRes?.results || storesIDRes || []);
        setDevelopers(devRes?.results || devRes || []);
        setCreators(creatorRes?.results || creatorRes || []);
        setStores(storeRes?.results || storeRes || []);
        setGameSeries(seriesRes?.results || []);
        const response = await fetch(`${API_URL}/comments/${id}`);
        const commentData = await response.json();
        setComments(commentData);
      } catch (error) {
        console.error("Erreur lors du chargement des données du jeu", error);
      }
    };

    fetchData();
  }, [id]);

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [...prev, newComment]);
  };
  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };
  const handleCommentEdited = (updatedComment) => {
    setComments((prev) =>
      prev.map((c) => (c._id === updatedComment._id ? updatedComment : c))
    );
  };

  if (!gameDetails)
    return <div className="text-white text-center p-5">Chargement...</div>;

  const storeAccessList =
    storesID.length > 0 && stores.length > 0
      ? storesID
          .map((storeIDItem) => {
            const storeInfo = stores.find((s) => s.id === storeIDItem.store_id);
            return storeInfo
              ? {
                  ...storeInfo,
                  url: storeIDItem.url,
                }
              : null;
          })
          .filter(Boolean)
      : [];

  return (
    <div className="game-page-container py-5 bg-dark text-light">
      {/* HEADER */}
      <header
        className="text-center text-white p-5 rounded mb-5"
        style={{
          backgroundImage: `url(${gameDetails.background_image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "280px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          boxShadow: "0 0 15px rgba(0,0,0,0.8)",
        }}
      >
        <h1 className="display-3 fw-bold text-shadow">{gameDetails.name}</h1>
        <p className="lead">{gameDetails.released || "Non spécifié"}</p>
      </header>

      {/* MAIN */}
      <main className="container">
        <Row>
          {/* LEFT COLUMN */}
          <Col lg={6}>
            <Card text="light" className="mb-4 shadow">
              <Card.Header className="fs-4 text-info fw-bold">Description</Card.Header>
              <Card.Body>
                <Card.Text style={{ whiteSpace: "pre-line" }}>
                  {gameDetails.description_raw}
                </Card.Text>
              </Card.Body>
            </Card>

            <Card text="light" className="mb-4 shadow">
              <Card.Header className="text-info fw-semibold">Genres</Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {gameDetails.genres.map((genre) => (
                    <Badge key={genre.id} bg="primary" pill>{genre.name}</Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>

            <Card text="light" className="mb-4 shadow">
              <Card.Header className="text-info fw-semibold">Tags</Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {gameDetails.tags.map((tag) => (
                    <Badge key={tag.id} bg="light" text="dark" pill>{tag.name}</Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>

            <Card text="light" className="mb-4 shadow">
              <Card.Header className="text-info fw-semibold">Jeux similaires</Card.Header>
              <Card.Body>
                <Row>
                  {gameSeries.map((game) => (
                    <Col key={game.id} md={4} className="mb-4">
                      <GameCard game={game} />
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            <Card text="light" className="shadow">
              <Card.Header className="text-info fw-semibold">Commentaires</Card.Header>
              <Card.Body>
                <Comments
                  comments={comments}
                  gameId={id}
                  isConnected={isConnected}
                  isAdmin={isAdmin}
                  onCommentAdded={handleCommentAdded}
                  onCommentDeleted={handleCommentDeleted}
                  onCommentEdited={handleCommentEdited}
                />
              </Card.Body>
            </Card>
          </Col>

          {/* RIGHT COLUMN */}
          <Col lg={6}>
            <Card text="light" className="mb-4 shadow">
              <Card.Header className="text-info fw-semibold">Infos complémentaires</Card.Header>
              <Card.Body>
                <Row>
                  <Col sm={12} md={4}>
                    <h6 className="text-info">Boutique</h6>
                    <ListGroup variant="flush" className="text-light small">
                      {storeAccessList.map((store) => (
                        <ListGroup.Item key={store.id} className="bg-transparent p-1 border-0 d-flex align-items-center">
                          {store.image_background && (
                            <Image src={store.image_background} rounded style={{ width: "40px", height: "40px", objectFit: "cover", marginRight: "10px" }} />
                          )}
                          <a href={store.url} target="_blank" rel="noopener noreferrer" className="text-info text-decoration-none">
                            {store.name}
                          </a>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Col>
                  <Col sm={12} md={4}>
                    <h6 className="text-info">Développeurs</h6>
                    <ListGroup variant="flush" className="text-light small">
                      {developers.map((dev) => (
                        <ListGroup.Item key={dev.id} className="bg-transparent text-white border-0 p-1">
                          {dev.name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Col>
                  <Col sm={12} md={4}>
                    <h6 className="text-info">Créateurs</h6>
                    <ListGroup variant="flush" className="text-light small">
                      {creators.map((creator) => (
                        <ListGroup.Item key={creator.id} className="bg-transparent text-white border-0 p-1">
                          {creator.name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card text="light" className="mb-4 shadow">
              <Card.Header className="text-info fw-semibold">Captures d'écran</Card.Header>
              <Card.Body>
                <Row>
                  {screenshots.map((shot, i) => (
                    <Col key={i} xs={6} className="mb-3">
                      <img src={shot.image} alt={`Screenshot ${i + 1}`} className="img-fluid rounded shadow-sm" />
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            <Card text="light" className="mb-4 shadow">
              <Card.Header className="text-info fw-semibold">Vidéos</Card.Header>
              <Card.Body>
                {videos.map((video, i) => {
                  const videoUrl = video.data.max || video.data["480"];
                  return (
                    <video key={i} controls width="100%" className="rounded shadow mb-3">
                      <source src={videoUrl} type="video/mp4" />
                      Votre navigateur ne supporte pas la vidéo.
                    </video>
                  );
                })}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </main>
    </div>
  );
};

export default GamePage;
