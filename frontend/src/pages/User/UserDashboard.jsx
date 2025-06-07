import React, { useContext, useState } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { FaUser, FaStar, FaCommentDots, FaSignOutAlt } from 'react-icons/fa';
import { Button } from 'react-bootstrap';
import UserProfile from './UserProfile';
import UserComments from './UserComments';
import UserFavorites from './UserFavorites';

const menuItems = [
  { id: 'profile', label: 'Mon Profil', icon: <FaUser /> },
  { id: 'favorites', label: 'Mes Favoris', icon: <FaStar /> },
  { id: 'comments', label: 'Mes Commentaires', icon: <FaCommentDots /> },
];

const UserDashboard = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#121212', color: '#eee' }}>
      <aside
        style={{
          width: '250px',
          backgroundColor: '#1f1f1f',
          borderRight: '1px solid #333',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '2rem',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontWeight: 'bold', color: '#00ffff' }}>
          Mon Compte
        </h2>
        <nav style={{ flexGrow: 1 }}>
          {menuItems.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '12px 20px',
                backgroundColor: activeTab === id ? '#00ffff' : 'transparent',
                color: activeTab === id ? '#121212' : '#eee',
                border: 'none',
                borderRadius: '6px',
                fontWeight: activeTab === id ? '700' : '500',
                cursor: 'pointer',
                marginBottom: '8px',
                transition: 'background-color 0.3s',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid #333' }}>
          <Button
            variant="outline-danger"
            onClick={() => logout()}
            style={{ width: '100%' }}
            title="Se déconnecter"
          >
            <FaSignOutAlt className="me-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      <main
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '2rem',
          margin: '0 auto',
          backgroundColor: '#181818',
        }}
      >
       {activeTab === 'profile' && <UserProfile userId={userInfo?.userId} />}
{activeTab === 'favorites' && <UserFavorites />}
{activeTab === 'comments' && <UserComments userId={userInfo?.userId} />}

      </main>
    </div>
  );
};

export default UserDashboard;
