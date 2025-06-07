import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Spinner, Form, Alert } from 'react-bootstrap';
import { FaPen } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const UserProfile = ({ userId }) => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [editMode, setEditMode] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewPic, setPreviewPic] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem('token');
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchUser = async () => {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserData(data);
      setFormData({ username: data.username, email: data.email });
      setLoading(false);
    };
    if (userId) fetchUser();
  }, [userId]);

  const handleUpdate = async () => {
    setLoading(true);

    const bodyData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
    };

    if (newPassword.trim()) {
      bodyData.password = newPassword.trim();
    }

    const res = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });
    

    if (res.ok) {
      setEditMode(false);
      setShowPasswordField(false);
      setNewPassword('');
      setSuccess('Profil mis à jour avec succès.');
      setUserData({ ...userData, ...bodyData });
      setError(null);
    } else {
      const errorData = await res.json();
  setError(errorData.message || 'Erreur lors de la mise à jour.');
  setSuccess(null);
    }

    setLoading(false);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewPic(URL.createObjectURL(file));
    setUploadLoading(true);

    const form = new FormData();
    form.append('photo', file);

    const res = await fetch(`${API_URL}/api/users/${userId}/upload-photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    const data = await res.json();
    setUserData((prev) => ({ ...prev, photo: data.filename }));
    setUploadLoading(false);
  };

  const profilePic = previewPic || (userData?.photo ? `${API_URL}/uploads/user_photos/${userData.photo}` : null);

  return loading ? (
    <Spinner animation="border" variant="info" />
  ) : (
    <Card className="p-4 text-white" style={{ backgroundColor: '#1e1e1e', maxWidth: '600px', margin: '0 auto' }}>
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="text-center position-relative mb-4">
        {profilePic ? (
          <img src={profilePic} alt="Profil" className="rounded-circle border" style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
        ) : (
          <div className="rounded-circle bg-info d-flex align-items-center justify-content-center text-dark fw-bold"
            style={{ width: '120px', height: '120px', fontSize: '40px' }}>
            {userData?.username?.[0]?.toUpperCase()}
          </div>
        )}
        <button
          className="btn btn-sm btn-info position-absolute"
          style={{ bottom: 0, left: '57%', transform: 'translateX(-50%)', borderRadius: '50%' }}
          onClick={() => fileInputRef.current.click()}
          title="Changer la photo"
        >
          <FaPen />
        </button>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handlePhotoChange} />
        {uploadLoading && <small className="d-block mt-2">Chargement...</small>}
      </div>

      {editMode ? (
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nom d'utilisateur</Form.Label>
            <Form.Control
              size="sm"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              size="sm"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </Form.Group>

          <Button
            variant="outline-light"
            className="mb-3"
            size="sm"
            onClick={() => setShowPasswordField(!showPasswordField)}
          >
            {showPasswordField ? 'Annuler le changement de mot de passe' : 'Modifier le mot de passe'}
          </Button>

          {showPasswordField && (
            <Form.Group className="mb-3">
              <Form.Label>Nouveau mot de passe</Form.Label>
              <Form.Control
                size="sm"
                type="password"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>
          )}

          <div className="d-flex justify-content-between">
            <Button variant="info" size="sm" onClick={handleUpdate}>Sauvegarder</Button>
            <Button variant="secondary" size="sm" onClick={() => {
              setEditMode(false);
              setShowPasswordField(false);
              setNewPassword('');
            }}>Annuler</Button>
          </div>
        </Form>
      ) : (
        <>
          <p><strong>Nom :</strong> {userData?.username}</p>
          <p><strong>Email :</strong> {userData?.email}</p>
          <p><strong>Mot de passe :</strong> ******</p>
          <Button variant="outline-info" size="sm" onClick={() => setEditMode(true)}>Modifier</Button>
        </>
      )}
    </Card>
  );
};

export default UserProfile;
