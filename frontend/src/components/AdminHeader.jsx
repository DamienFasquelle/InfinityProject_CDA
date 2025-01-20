import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap'; 
import logo from '../assets/images/logo.png';

const AdminHeader = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUserInfo(decodedToken);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserInfo(null);
    navigate('/login');
   
  };

  return (
    <header className="admin-header-container">
      <Navbar expand="lg" bg="dark" variant="dark" className="py-0">
        <Container className="d-flex justify-content-between align-items-center">
          {/* Logo aligné à gauche */}
          <Navbar.Brand as={Link} to="/admin">
            <img
              src={logo}
              alt="Infinity Games Logo"
              className="navbar-logo d-inline-block align-top"
              height="80"
            />
          </Navbar.Brand>

          {/* Menu centré */}
          <Navbar.Collapse id="navbar-nav" className="mx-auto">
            <Nav className="d-flex justify-content-center">
              <Nav.Link as={Link} to="/admin" className="nav-link">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/admin/users" className="nav-link">Gérer les utilisateurs</Nav.Link>
              <Nav.Link as={Link} to="/admin/games" className="nav-link">Gérer les jeux</Nav.Link>
              <Nav.Link as={Link} to="/admin/stats" className="nav-link">Statistiques</Nav.Link>
            </Nav>
          </Navbar.Collapse>

          {/* Bouton de déconnexion aligné à droite */}
          <div className="d-flex align-items-center ms-3">
            <Button variant="danger" onClick={handleLogout} className="ms-2">Déconnexion</Button>
          </div>
        </Container>
      </Navbar>
    </header>
  );
};

export default AdminHeader;
