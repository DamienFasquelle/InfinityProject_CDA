import React, { useContext, useState } from 'react';
import { Button } from 'react-bootstrap';
import { AuthContext } from '../../providers/AuthProvider';
import UserProfile from './UserProfile';
import UserFavorites from './UserFavorites';
import UserComments from './UserComments';

const UserDashboard = () => {
  const { userInfo } = useContext(AuthContext);
  const [selectedView, setSelectedView] = useState('profile');

  const renderMenu = () => (
    <div className="d-flex justify-content-around bg-dark text-light p-3 mb-4">
      <Button variant={selectedView === 'profile' ? 'info' : 'outline-info'} onClick={() => setSelectedView('profile')}>Profil</Button>
      <Button variant={selectedView === 'favorites' ? 'info' : 'outline-info'} onClick={() => setSelectedView('favorites')}>Favoris</Button>
      <Button variant={selectedView === 'comments' ? 'info' : 'outline-info'} onClick={() => setSelectedView('comments')}>Commentaires</Button>
    </div>
  );

  return (
    <div className="container mt-4">
      {renderMenu()}
      {selectedView === 'profile' && <UserProfile userId={userInfo?.userId} />}
      {selectedView === 'favorites' && <UserFavorites />}
      {selectedView === 'comments' && <UserComments userId={userInfo?.userId} />}
    </div>
  );
};

export default UserDashboard;
