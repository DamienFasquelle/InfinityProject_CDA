import React, { useState, useEffect, useContext } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { fetchGameVideos } from '../services/rawgService';
import { FavoritesContext } from '../providers/FavoritesProvider';


const GameCard = ({ game }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [videos, setVideos] = useState([]);
  const { isFavorite, toggleFavorite, isAuthenticated } = useContext(FavoritesContext); 

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const videoData = await fetchGameVideos(game.id);
        setVideos(videoData.results || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données du jeu', error);
      }
    };

    if (game.id) {
      fetchDetails();
    }
  }, [game.id]);

  const handleViewGamePage = () => {
    navigate(`/gamepage/${game.id}`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const videoUrl = videos.length > 0 ? (videos[0].data.max || videos[0].data['480']) : null;

  const limitedPlatforms = game.platforms?.slice(0, 3);
  const limitedGenres = game.genres?.slice(0, 3);

  return (
    <Card
      className="game-card d-flex flex-column card-hover"
      style={{ height: '480px', width: '100%', maxWidth: '300px', position: 'relative' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHovered && videoUrl ? (
        <Card.Img
          variant="top"
          as="video"
          controls
          loop
          autoPlay
          muted
          src={videoUrl}
          loading='lazy'
          alt={game.name}
          className="game-card-img"
          style={{ height: '200px', objectFit: 'cover' }}
        />
      ) : (
        <Card.Img
          variant="top"
          src={game.background_image || 'https://via.placeholder.com/150'}
          alt={game.name}
                    loading='lazy'

          className="game-card-img"
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      <Card.Body className="game-card-body d-flex flex-column" style={{ flex: 1, overflow: 'hidden' }}>
        <Card.Title>{game.name}</Card.Title>
        <Card.Text style={{ flexGrow: 1, overflow: 'hidden' }}>
          <strong>Date de sortie :</strong> {game.released || 'N/A'} <br />
          <strong>Note :</strong> {game.rating || 'Non noté'} / 5 <br />
          <strong>Plateformes : </strong>
          {limitedPlatforms?.map((p) => p.platform.name).join(', ')}{game.platforms?.length > 3 ? '...' : ''} <br />
          <strong>Genres :</strong> {limitedGenres?.map((g) => g.name).join(', ')}{game.genres?.length > 3 ? '...' : ''} <br />
        </Card.Text>
        <div className="d-flex justify-content-between align-items-center">
          <Button variant="primary" onClick={handleViewGamePage}>
            Voir le jeu
          </Button>
        </div>
      </Card.Body>

      {/* Cœur pour les favoris */}
      {isAuthenticated && (
        <div
          className={`favorite-heart ${isFavorite(game.id) ? 'filled' : ''}`}
          style={{
            color: isFavorite(game.id) ? 'red' : 'gray', 
            fontSize: '24px', 
            cursor: 'pointer',
            position: 'absolute',
            top: '10px',
            right: '10px',
            
          }}
          onClick={() => toggleFavorite(game.id)}
        >
          {isFavorite(game.id) ? '❤️' : '🤍'}
        </div>
      )}
    </Card>
  );
};

export default GameCard;
