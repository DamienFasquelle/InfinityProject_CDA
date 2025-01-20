import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Row, Col, Form, Button } from "react-bootstrap";
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

  // Gestion de la recherche
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    handleSearch(e.target.value);
    setShowResults(true);
  };

  const handleSelectResult = (selected) => {
    const selectedGame = searchResults.find(result => result.name === selected);
    if (selectedGame) {
      localStorage.setItem("selectedGameId", selectedGame.id);
      navigate(`/gamepage/${selectedGame.id}`);
    }
    setSearchQuery(selected);
    setShowResults(false);
  };

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
          <Navbar.Brand as={Link} to="/" className="col-12 col-lg-auto">
            <img
              src={logo}
              alt="Infinity Games Logo"
              className="navbar-logo d-inline-block align-top"
              height="40"
            />
          </Navbar.Brand>

          {/* Menu Burger (responsive) */}
          <Navbar.Toggle aria-controls="navbar-nav" />

          <Navbar.Collapse id="navbar-nav" className="col-12 col-lg-auto">
            <Row className="w-100">
              <Col xs={12} lg={8}>
                <Nav className="d-flex justify-space-around w-100">
                  <Nav.Link as={Link} to="/games">
                    Jeux
                  </Nav.Link>
                  {isAdmin && (
                    <Nav.Link as={Link} to="/admin">
                      Administration
                    </Nav.Link>
                  )}
                  {isUser && !isAdmin && (
                    <Nav.Link as={Link} to="/user">
                      Mon compte
                    </Nav.Link>
                  )}
                </Nav>
              </Col>

              {/* Barre de recherche */}
              <Col xs={12} lg={4} className="d-flex justify-content-end align-items-center">
                <Form className="search-form-container" role="search" style={{ width: '100%' }}>
                  <input
                    type="text"
                    placeholder="Trouver votre jeu"
                    className="search-input form-control"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {showResults && searchQuery && (
                    <select
                      size="5"
                      onChange={(e) => handleSelectResult(e.target.value)}
                      className="search-dropdown form-control"
                    >
                      {searchResults?.map((result, index) => (
                        <option key={index} value={result.name}>
                          {result.name}
                        </option>
                      ))}
                    </select>
                  )}
                </Form>

                {/* Boutons de connexion / déconnexion */}
                {isAuthenticated ? (
                  <>
                    <Button variant="danger" onClick={logout} className="ms-2">
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <Link className="btn btn-gradient ms-2" to="/login">
                    Connexion
                  </Link>
                )}
              </Col>
            </Row>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
