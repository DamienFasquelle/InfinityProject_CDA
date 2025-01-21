import React, { useState } from 'react';
import { FaUser, FaHeart, FaComments } from 'react-icons/fa'; // Importation des icônes
import UserProfile from './UserProfile';
import UserComments from './UserComments';
import UserFavorites from './UserFavorites';

const UserDashboard = () => {
  const [selectedView, setSelectedView] = useState('profile');

  const renderView = () => {
    switch (selectedView) {
      case 'profile':
        return <UserProfile />;
      case 'favorites':
        return <UserFavorites />;
      case 'comments':
        return <UserComments />;
      default:
        return <UserProfile />;
    }
  };

  return (
    <div className="user-dashboard-container" style={{ display: 'flex' }}>
      <div className="sidebar" style={{ width: '20%', borderRight: '1px solid #ddd', padding: '1rem' }}>
        <h3 style={{ color: '#00ffff' }}>Menu</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ margin: '20px 0' }}>
            <button
              onClick={() => setSelectedView('profile')}
              style={{ background: 'none', color: '#00ffff', border: 'none', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <FaUser style={{ fontSize: '1.3rem' }} />
              Mes informations
            </button>
          </li>
          <li style={{ margin: '20px 0' }}>
            <button
              onClick={() => setSelectedView('favorites')}
              style={{ background: 'none', color: '#00ffff', border: 'none', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <FaHeart style={{ fontSize: '1.3rem' }} />
              Mes jeux en favoris
            </button>
          </li>
          <li style={{ margin: '20px 0' }}>
            <button
              onClick={() => setSelectedView('comments')}
              style={{ background: 'none', color: '#00ffff', border: 'none', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <FaComments style={{ fontSize: '1.3rem' }} />
              Mes commentaires
            </button>
          </li>
        </ul>
      </div>
      <div className="main-content" style={{ flex: 1, padding: '1rem' }}>
        {renderView()}
      </div>
    </div>
  );
};

export default UserDashboard;
