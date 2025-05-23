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
} from "../services/rawgService";
import Comments from "./Comments";
import { AuthContext } from "../providers/AuthProvider";

const GamePage = () => {
  const { id } = useParams();
  const { isConnected, isAdmin } = useContext(AuthContext);

  const [gameDetails, setGameDetails] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [videos, setVideos] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [creators, setCreators] = useState([]);
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
        ] = await Promise.all([
          fetchGameDetails(id),
          fetchGameScreenshots(id),
          fetchGameVideos(id),
          fetchStoresID(id),
          fetchDevelopers(),
          fetchCreators(),
          fetchStores(),
        ]);
        const API_URL = process.env.REACT_APP_API_URL;
        setGameDetails(gameRes);
        setScreenshots(screenRes?.results || []);
        setVideos(videoRes?.results || []);
        setStoresID(storesIDRes ?.results || storesIDRes  || []);
        setDevelopers(devRes?.results || devRes || []);
        setCreators(creatorRes?.results || creatorRes || []);
        setStores(storeRes?.results || storeRes || []);
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

  const storeAccessList = storesID.length > 0 && stores.length > 0
  ? storesID.map(storeIDItem => {
      const storeInfo = stores.find(s => s.id === storeIDItem.store_id);
      return storeInfo
        ? {
            ...storeInfo,
            url: storeIDItem.url,
          }
        : null;
    }).filter(Boolean)
  : [];

  return (
    <div className="game-page-container py-5 bg-dark text-light">
      {/* HEADER */}
      <header
        className="game-header text-center text-white p-4 mb-5 rounded"
        style={{
          backgroundImage: `url(${gameDetails.background_image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "250px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          boxShadow: "0 0 15px rgba(0,0,0,0.8)",
        }}
      >
        <h1 className="display-4 fw-bold text-shadow">{gameDetails.name}</h1>
        <p className="lead">{gameDetails.released || "Non spécifié"}</p>
      </header>

      {/* MAIN CONTENT */}
      <main className="container">
        <Row>
          {/* COL GAUCHE */}
          <Col lg={6} className="pe-lg-4">
            {/* Description */}
            <Card text="light" className="mb-4 shadow">
              <Card.Header className="fw-bold fs-4 text-info">Description</Card.Header>
              <Card.Body>
                <Card.Text style={{ whiteSpace: "pre-line" }}>
                  {gameDetails.description_raw}
                </Card.Text>
              </Card.Body>
            </Card>

            {/* Genres */}
            <Card text="light" className="mb-4 shadow">
              <Card.Header className="fw-bold fs-5 text-info">Genres</Card.Header>
              <Card.Body>
                {gameDetails.genres.length === 0 && <p>Aucun genre disponible</p>}
                <div className="d-flex flex-wrap gap-2">
                  {gameDetails.genres.map((genre) => (
                    <Badge key={genre.id} bg="primary" pill>
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {/* Tags */}
            <Card text="light" className="mb-4 shadow">
              <Card.Header className="fw-bold fs-5 text-info">Tags</Card.Header>
              <Card.Body>
                {gameDetails.tags.length === 0 && <p>Aucun tag disponible</p>}
                <div className="d-flex flex-wrap gap-2">
                  {gameDetails.tags.map((tag) => (
                    <Badge key={tag.id} pill>
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
             {/* Comments */}
            <Card text="light" className="shadow">
              <Card.Header className="fw-bold fs-5 text-info">Commentaires</Card.Header>
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

          {/* COL DROITE */}
          <Col lg={6} className="ps-lg-4">
            {/* Devs, Créateurs, Magasins */}
            <Card text="light" className="mb-4 shadow">
              <Card.Header className="fw-bold fs-5 text-info">Infos complémentaires</Card.Header>
              <Card.Body>
                <Row>
                 <Col sm={12} md={4}>
                    <h6 className="text-info">Boutique</h6>
                    <ListGroup variant="flush" className="text-light small">
                      {storeAccessList.length === 0 ? (
                        <p>Le jeu n'est pas disponible</p>
                      ) : (
                        storeAccessList.map(store => (
                          <ListGroup.Item
                            key={store.id}
                            className="bg-transparent text-light p-1 border-0 d-flex align-items-center"
                          >
                            {store.image_background && (
                              <Image
                                src={store.image_background}
                                alt={store.name}
                                rounded
                                style={{ width: "40px", height: "40px", objectFit: "cover", marginRight: "10px" }}
                              />
                            )}
                            <a
                              href={store.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none text-info"
                            >
                              {store.name}
                            </a>
                          </ListGroup.Item>
                        ))
                      )}
                    </ListGroup>
                  </Col>   
                  <Col sm={12} md={4} className="mb-3 mb-md-0">
                    <h6 className="text-info">Développeurs</h6>
                    <ListGroup variant="flush" className="text-light small">
                      {developers.length === 0 ? <p>Aucun développeur trouvé</p> : 
                      developers.map((dev) => (
                        <ListGroup.Item key={dev.id} className="bg-transparent text-light p-1 border-0">
                          {dev.name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Col>
                  <Col sm={12} md={4} className="mb-3 mb-md-0">
                    <h6 className="text-info">Créateurs</h6>
                    <ListGroup variant="flush" className="text-light small">
                      {creators.length === 0 ? <p>Aucun créateur trouvé</p> : 
                      creators.map((creator) => (
                        <ListGroup.Item key={creator.id} className="bg-transparent text-light p-1 border-0">
                          {creator.name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Col>
                                
                </Row>
              </Card.Body>
            </Card>

            {/* Screenshots */}
            <Card text="light" className="mb-4 shadow">
              <Card.Header className="fw-bold fs-5 text-info">Captures d'écran</Card.Header>
              <Card.Body>
                {screenshots.length === 0 ? (
                  <p>Aucune capture disponible</p>
                ) : (
                  <Row>
                    {screenshots.map((shot, i) => (
                      <Col key={i} xs={6} className="mb-3">
                        <img
                          src={shot.image}
                          alt={`Screenshot ${i + 1}`}
                          className="img-fluid rounded shadow-sm"
                        />
                      </Col>
                    ))}
                  </Row>
                )}
              </Card.Body>
            </Card>

            {/* Vidéos */}
            <Card text="light" className="mb-4 shadow">
              <Card.Header className="fw-bold fs-5 text-info">Vidéos</Card.Header>
              <Card.Body>
                {videos.length === 0 ? (
                  <p>Aucune vidéo disponible</p>
                ) : (
                  videos.map((video, i) => {
                    const videoUrl = video.data.max || video.data["480"];
                    return (
                      <video
                        key={i}
                        controls
                        width="100%"
                        className="rounded shadow mb-3"
                      >
                        <source src={videoUrl} type="video/mp4" />
                        Votre navigateur ne supporte pas la vidéo.
                      </video>
                    );
                  })
                )}
              </Card.Body>
            </Card>

           
          </Col>
        </Row>
      </main>
    </div>
  );
};

export default GamePage;
