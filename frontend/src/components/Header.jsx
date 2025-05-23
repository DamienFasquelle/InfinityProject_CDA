import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Form, Button, InputGroup } from "react-bootstrap";
import { FaTimes, FaSearch } from "react-icons/fa";
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

  // Nouvel état pour afficher la recherche sur mobile
  const [showSearchMobile, setShowSearchMobile] = useState(false);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
    setShowResults(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
    handleSearch("");
  };

  const handleSelectResult = (selected) => {
    const selectedGame = searchResults.find((result) => result.name === selected);
    if (selectedGame) {
      localStorage.setItem("selectedGameId", selectedGame.id);
      navigate(`/gamepage/${selectedGame.id}`);
    }
    setSearchQuery(selected);
    setShowResults(false);
    setShowSearchMobile(false); // cache la barre après sélection sur mobile
  };

  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setShowResults(false);
      if (window.innerWidth < 992) { // breakpoint lg bootstrap
        setShowSearchMobile(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus automatiquement input quand barre mobile s'affiche
  useEffect(() => {
    if (showSearchMobile && searchRef.current) {
      const input = searchRef.current.querySelector("input");
      if (input) input.focus();
    }
  }, [showSearchMobile]);

  return (
    <header className="header-container">
      <Navbar expand="lg" bg="dark" variant="dark" className="py-3">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img src={logo} alt="Infinity Games Logo" height="40" />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="navbar-nav" />

          <Navbar.Collapse id="navbar-nav" className="align-items-center">
            <Nav className="navbar-nav me-auto">
              <Nav.Link as={Link} to="/games">Jeux</Nav.Link>
              {isAdmin && <Nav.Link as={Link} to="/admin">Administration</Nav.Link>}
              {isUser && !isAdmin && (
                <>
                  <Nav.Link as={Link} to="/recommandation">Jeux recommandés</Nav.Link>
                  <Nav.Link as={Link} to="/user">Mon compte</Nav.Link>
                </>
              )}
            </Nav>

            {/* Bouton loupe visible uniquement mobile */}
            <Button
              variant="outline-light"
              className="d-lg-none me-2"
              onClick={() => setShowSearchMobile(true)}
              aria-label="Afficher la barre de recherche"
            >
              <FaSearch />
            </Button>

            {/* Barre de recherche desktop et mobile */}
            {(showSearchMobile || window.innerWidth >= 992) && (
              <Form
                ref={searchRef}
                className="search-form d-flex"
                style={{
                  position: "relative",
                  width: window.innerWidth >= 992 ? "400px" : "100%",
                  marginRight: window.innerWidth >= 992 ? "1rem" : "0",
                  zIndex: 1050,
                }}
                onSubmit={e => e.preventDefault()}
              >
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Rechercher un jeu"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoComplete="off"
                    aria-label="Rechercher un jeu"
                  />
                  {searchQuery && (
                    <InputGroup.Text
                      onClick={clearSearch}
                      className="clear-icon"
                      style={{ cursor: "pointer" }}
                      aria-label="Effacer la recherche"
                    >
                      <FaTimes />
                    </InputGroup.Text>
                  )}
                </InputGroup>

                {showResults && searchQuery && (
                  <div
                    className="search-results shadow-sm bg-dark text-light"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      borderRadius: "0 0 var(--border-radius) var(--border-radius)",
                      maxHeight: "300px",
                      overflowY: "auto",
                      border: "1px solid var(--secondary)",
                      borderTop: "none",
                    }}
                  >
                    {searchResults.length === 0 ? (
                      <div
                        className="search-item px-3 py-2 text-muted"
                        style={{ userSelect: "none" }}
                      >
                        Aucun résultat
                      </div>
                    ) : (
                      searchResults.map((result, index) => (
                        <div
                          key={index}
                          onClick={() => handleSelectResult(result.name)}
                          className="search-item px-3 py-2"
                          style={{ cursor: "pointer" }}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {result.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Form>
            )}

            {isAuthenticated ? (
              <Button variant="danger" onClick={logout}>
                Déconnexion
              </Button>
            ) : (
              <Link to="/login" className="btn btn-gradient">
                Connexion
              </Link>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
