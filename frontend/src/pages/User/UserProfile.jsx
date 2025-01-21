import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import { Button, Col, Row, Form } from "react-bootstrap";


const UserProfile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const { userInfo } = useContext(AuthContext);
  
    useEffect(() => {
      if (!userInfo || !userInfo.userId) {
        console.error("Informations utilisateur non disponibles");
        setLoading(false);
        return;
      }
  
      const fetchUserProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Utilisateur non authentifié");
          setLoading(false);
          return;
        }
  
        try {
          const response = await fetch(
            `http://127.0.0.1:8000/api/users/${userInfo.userId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          } else {
            console.error("Erreur lors de la récupération des informations utilisateur");
          }
        } catch (error) {
          console.error("Erreur:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchUserProfile();
    }, [userInfo]);
  
    const handleUpdate = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem("token");
      const formData = new FormData(e.target);
  
      const updatedData = {
        username: formData.get("username"),
        email: formData.get("email"),
        // Si le mot de passe est vide, on ne l'envoie pas
        password: formData.get("password") ? formData.get("password") : undefined,
      };
  
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/users/${userInfo.userId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
          }
        );
  
        if (response.ok) {
          alert("Informations mises à jour avec succès");
          window.location.reload();
        } else {
          console.error("Erreur lors de la mise à jour");
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    };
  
    if (loading) return <p>Chargement des informations...</p>;
    if (!userData) return <p>Aucune information utilisateur trouvée.</p>;

  return (
    <div className="">
    <h2>Mes informations</h2>
    <Form className="" onSubmit={handleUpdate}>
      <Row className="mb-3">
        <Col xs={12} md={4}>
          <Form.Group controlId="username">
            <Form.Label>Nom d'utilisateur:</Form.Label>
            <Form.Control
              type="text"
              name="username"
              defaultValue={userData.username}
            />
          </Form.Group>
        </Col>
        <Col xs={12} md={4}>
          <Form.Group controlId="email">
            <Form.Label>Email:</Form.Label>
            <Form.Control
              type="email"
              name="email"
              defaultValue={userData.email}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col xs={12} md={3}>
          <Form.Group controlId="password">
            <Form.Label>Mot de passe:</Form.Label>
            <div className="password-container d-flex">
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Laisser vide si inchangé"
              />
              <Button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                variant="outline-secondary"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </div>
          </Form.Group>
        </Col>
      </Row>

      <Button className="btn-gradient" type="submit">
        Mettre à jour
      </Button>
    </Form>
  </div>
);
};

export default UserProfile;
