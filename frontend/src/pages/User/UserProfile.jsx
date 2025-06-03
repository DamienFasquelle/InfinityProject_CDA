import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Spinner } from 'react-bootstrap';
import { FaEdit, FaTrash, FaCheck, FaUser } from 'react-icons/fa';

const UserProfile = ({ userId }) => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [newPic, setNewPic] = useState(null);
  const [previewPic, setPreviewPic] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserData(data);
      setFormData({ username: data.username, email: data.email });
    };
    if (userId) fetchUser();
  }, [userId, API_URL]);

  // Extraire les 2 premières lettres du username en majuscule
  const getInitials = (username) => {
    if (!username) return '';
    return username.slice(0, 2).toUpperCase();
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    alert('Profil mis à jour');
    setEditMode(false);
    // Rafraichir les données utilisateur
    setUserData(prev => ({ ...prev, username: formData.username, email: formData.email }));
  };

  const handlePhotoUpload = async () => {
    if (!newPic) return;

    setLoading(true);
    const form = new FormData();
    form.append('photo', newPic);

    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/users/${userId}/upload-photo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await res.json();
    if (res.ok) {
      setUserData(prev => ({ ...prev, photo: data.filename }));
      setPreviewPic(null);
      setNewPic(null);
    } else {
      alert(data.message || 'Erreur lors de l’upload.');
    }
    setLoading(false);
  };

  const handlePhotoDelete = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/users/${userId}/photo`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      setUserData(prev => ({ ...prev, photo: null }));
      alert('Photo supprimée avec succès.');
    } else {
      alert(data.message || 'Erreur lors de la suppression.');
    }
  };

  const profilePicUrl = previewPic || (userData?.photo ? `${API_URL}/uploads/user_photos/${userData.photo}` : null);

  return (
    <Card className="p-4 mb-4 shadow-sm bg-dark text-white" style={{ maxWidth: '400px', margin: 'auto' }}>
      <h3 className="text-center mb-4">
        <FaUser style={{ marginRight: '8px' }} />
        Mon Profil
      </h3>

      <div className="text-center mb-4">
        {profilePicUrl ? (
          <img
            src={profilePicUrl}
            alt="Profil"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #00ffff',
            }}
          />
        ) : (
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: '#00ffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#001',
              userSelect: 'none',
              border: '3px solid #00ffff',
              margin: 'auto',
            }}
          >
            {getInitials(userData?.username)}
          </div>
        )}

        <div className="mt-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setNewPic(file);
              setPreviewPic(URL.createObjectURL(file));
            }}
            style={{ marginBottom: '10px' }}
          />
          {newPic && (
            <Button
              variant="success"
              size="sm"
              className="me-2"
              onClick={handlePhotoUpload}
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : <><FaCheck /> Valider la photo</>}
            </Button>
          )}
          {userData?.photo && !newPic && (
            <Button variant="danger" size="sm" onClick={handlePhotoDelete}>
              <FaTrash /> Supprimer la photo
            </Button>
          )}
        </div>
      </div>

      {editMode ? (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Nom d'utilisateur</Form.Label>
            <Form.Control
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              style={{ backgroundColor: '#222', color: 'white', borderColor: '#00ffff' }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ backgroundColor: '#222', color: 'white', borderColor: '#00ffff' }}
            />
          </Form.Group>
          <Button onClick={handleUpdate} variant="primary" className="me-2">
            Sauvegarder
          </Button>
          <Button variant="secondary" onClick={() => setEditMode(false)}>
            Annuler
          </Button>
        </>
      ) : (
        <>
          <p><strong>Nom d'utilisateur :</strong> {userData?.username}</p>
          <p><strong>Email :</strong> {userData?.email}</p>
          <Button variant="outline-primary" onClick={() => setEditMode(true)}>
            <FaEdit /> Modifier
          </Button>
        </>
      )}
    </Card>
  );
};

export default UserProfile;
