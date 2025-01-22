import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import logo from "../assets/images/logo.png";
import { useGames } from "../providers/GameProvider";
import { AuthContext } from "../providers/AuthProvider";

const Header = () => {
  const { isAuthenticated, isAdmin, isUser, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { searchResults, handleSearch } = useGames();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Mise à jour du champ de recherche
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    handleSearch(e.target.value);
    setShowResults(true);
  };

  // Réinitialisation du champ de recherche
  const clearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
    handleSearch(""); // Mettre à jour les résultats
  };

  // Sélection d'un résultat
  const handleSelectResult = (selected) => {
    const selectedGame = searchResults.find((result) => result.name === selected);
    if (selectedGame) {
      localStorage.setItem("selectedGameId", selectedGame.id);
      navigate(`/gamepage/${selectedGame.id}`);
    }
    setSearchQuery(selected);
    setShowResults(false);
  };

  // Clic en dehors de la zone de recherche
  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setShowResults(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header-container">
      <Navbar expand="lg" bg="dark" variant="dark" className="py-3">
        <Container>
          {/* Logo */}
          <Navbar.Brand as={Link} to="/">
            <img src={logo} alt="Infinity Games Logo" height="40" />
          </Navbar.Brand>

          {/* Menu Burger pour mobile */}
          <Navbar.Toggle aria-controls="navbar-nav" />

          <Navbar.Collapse id="navbar-nav">
            {/* Menu à gauche */}
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/games">Jeux</Nav.Link>
              {isAdmin && <Nav.Link as={Link} to="/admin">Administration</Nav.Link>}
              {isUser && !isAdmin && (
                <>
                  <Nav.Link as={Link} to="/recommandation">Jeux recommandés</Nav.Link>
                  <Nav.Link as={Link} to="/user">Mon compte</Nav.Link>
                </>
              )}
            </Nav>

            <Form className="search-form" ref={searchRef}>
              <Row className="align-items-center">
                <Col xs={12} md={12} lg={12}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Rechercher un jeu"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="form-control"
                    />
                    {searchQuery && (
                      <InputGroup.Text onClick={clearSearch} className="clear-icon">
                        <FaTimes style={{ cursor: "pointer" }} />
                      </InputGroup.Text>
                    )}
                  </InputGroup>
                  {showResults && searchQuery && (
                    <div className="search-results">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          onClick={() => handleSelectResult(result.name)}
                          className="search-item"
                        >
                          {result.name}
                        </div>
                      ))}
                    </div>
                  )}
                </Col>
              </Row>
            </Form>

            {/* Bouton de connexion/déconnexion */}
            {isAuthenticated ? (
              <Button variant="danger" onClick={logout}>Déconnexion</Button>
            ) : (
              <Link to="/login" className="btn btn-gradient">Connexion</Link>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
