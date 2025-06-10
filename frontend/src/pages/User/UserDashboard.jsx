import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { FaUser, FaStar, FaCommentDots, FaBars, FaTimes } from 'react-icons/fa';
import UserProfile from './UserProfile';
import UserComments from './UserComments';
import UserFavorites from './UserFavorites';

const menuItems = [
  { id: 'profile', label: 'Mon Profil', icon: <FaUser /> },
  { id: 'favorites', label: 'Mes Favoris', icon: <FaStar /> },
  { id: 'comments', label: 'Mes Commentaires', icon: <FaCommentDots /> },
];

const UserDashboard = () => {
  const { userInfo } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuClick = (id) => {
    setActiveTab(id);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#121212', color: '#eee' }}>
      
      {/* Header simplifié */}
      <header
        style={{
          height: '60px',
          backgroundColor: '#1f1f1f',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1rem',
          color: '#00ffff',
          position: 'relative',
          zIndex: 0,
          justifyContent: 'space-between',
        }}
      >
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00ffff',
              fontSize: '1.8rem',
              cursor: 'pointer',
            }}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        )}
        <h2 style={{ margin: 0, fontWeight: 'bold' }}>Mon Compte</h2>
      </header>

      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 250,
            backgroundColor: '#1f1f1f',
            borderRight: '1px solid #333',
            display: isMobile ? (sidebarOpen ? 'flex' : 'none') : 'flex',
            flexDirection: 'column',
            paddingTop: '2rem',
            position: isMobile ? 'absolute' : 'relative',
        
    
            height: isMobile ? 'calc(100vh - 60px)' : 'auto',
            zIndex: 1500,
            boxShadow: isMobile ? '2px 0 8px rgba(0,0,0,0.8)' : 'none',
          }}
        >
          <nav style={{ flexGrow: 1, paddingLeft: '1rem', paddingRight: '1rem' }}>
            {menuItems.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => handleMenuClick(id)}
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
        </aside>

        {/* Main content */}
        <main
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: '1rem 1rem 2rem 1rem',
            marginTop: '0px',
            backgroundColor: '#181818',
          }}
        >
          {activeTab === 'profile' && <UserProfile userId={userInfo?.userId} />}
          {activeTab === 'favorites' && <UserFavorites />}
          {activeTab === 'comments' && <UserComments userId={userInfo?.userId} />}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
