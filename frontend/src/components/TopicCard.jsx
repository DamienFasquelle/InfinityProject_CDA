import React from 'react';
import { Card, Image } from 'react-bootstrap';
import { FaCalendarAlt, FaImage } from 'react-icons/fa';
import Avatar from './Avatar';

const TopicCard = ({ topic, baseUrl }) => {
  const handleClick = () => {
    window.location.href = `/forum/topic/${topic.id}`;
  };

  return (
    <Card className="mb-3 shadow-sm border-0" bg="dark" text="light" style={{ cursor: 'pointer' }} onClick={handleClick}>
      <Card.Body className="d-flex align-items-center">
        {topic.image ? (
          <Image
            src={`${baseUrl}${topic.image}`}
            alt={`Image du topic ${topic.title}`}
            rounded
            style={{ width: 80, height: 80, objectFit: 'cover', marginRight: 15 }}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 80,
              marginRight: 15,
              backgroundColor: '#343a40',
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#6c757d',
              fontSize: 24,
            }}
          >
            <FaImage />
          </div>
        )}

        <div style={{ flex: 1 }}>
          <Card.Title className="mb-1">{topic.title}</Card.Title>
          <Card.Text className="text-white-50 mb-0" style={{ fontSize: '0.9rem' }}>
            {topic.description}
          </Card.Text>
        </div>

        <div className="d-flex flex-column align-items-end justify-content-between" style={{ minWidth: 130, fontSize: '0.8rem', color: '#adb5bd' }}>
          <div title={`Publié le ${new Date(topic.createdAt).toLocaleString()}`}>
            <FaCalendarAlt className="me-1" />
            {new Date(topic.createdAt).toLocaleDateString()}
          </div>
          <div className="d-flex align-items-center mt-2">
            <Avatar username={topic.user?.username} photo={topic.user?.photo ? `${baseUrl}/uploads/user_photos/${topic.user.photo}` : null} size={30} />
            <span className="text-light ms-1">{topic.user?.username || 'Utilisateur'}</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TopicCard;
