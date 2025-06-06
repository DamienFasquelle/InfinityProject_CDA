import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Form, Button, InputGroup, Spinner, Image, Dropdown } from "react-bootstrap";
import { FaTimes, FaSearch, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import logo from "../assets/images/logo.png";
import { useGames } from "../providers/GameProvider";
import { AuthContext } from "../providers/AuthProvider";

const Header = () => {
  const { isAuthenticated, isAdmin, isUser, logout, user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const { searchResults, handleSearch } = useGames();
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(true);
    setLoadingSearch(true);
    await handleSearch(value);
    setLoadingSearch(false);
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
    setShowSearchMobile(false);
  };

  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setShowResults(false);
      if (window.innerWidth < 992) {
        setShowSearchMobile(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/games">Bibliothèque de jeux</Nav.Link>
              <Nav.Link as={Link} to="/forum">Forum</Nav.Link>
              {isAdmin && <Nav.Link as={Link} to="/admin">Administration</Nav.Link>}
              {isUser && isAdmin && (
                <>
                  <Nav.Link as={Link} to="/recommandation">Jeux recommandés</Nav.Link>
                  <Nav.Link as={Link} to="/similar-games">Jeux similaires</Nav.Link>
                </>
              )}
            </Nav>

            <div className="d-flex align-items-center">
              <Button
                variant="outline-light"
                className="d-lg-none me-2"
                onClick={() => setShowSearchMobile(true)}
                aria-label="Afficher la recherche"
              >
                <FaSearch />
              </Button>

              {(showSearchMobile || window.innerWidth >= 992) && (
                <Form
                  ref={searchRef}
                  className="search-form d-flex me-3"
                  style={{ position: "relative", width: window.innerWidth >= 992 ? "350px" : "100%" }}
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
                      <InputGroup.Text onClick={clearSearch} style={{ cursor: "pointer" }}>
                        <FaTimes />
                      </InputGroup.Text>
                    )}
                  </InputGroup>

                  {showResults && searchQuery && (
                    <div className="search-results shadow-sm bg-dark text-light"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        maxHeight: "300px",
                        overflowY: "auto",
                        border: "1px solid #6c757d",
                        borderTop: "none",
                        zIndex: 1050,
                      }}
                    >
                      {loadingSearch ? (
                        <div className="text-center p-3">
                          <Spinner animation="border" size="sm" variant="light" />
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="px-3 py-2 text-muted">Aucun résultat</div>
                      ) : (
                        searchResults.map((result, index) => (
                          <div
                            key={index}
                            onClick={() => handleSelectResult(result.name)}
                            className="px-3 py-2"
                            style={{ cursor: "pointer" }}
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
                <Dropdown align="">
                  <Dropdown.Toggle variant="outline-light" id="user-dropdown" className="d-flex align-items-center">
                    {user?.avatarUrl ? (
                      <Image src={user.avatarUrl} roundedCircle width="30" height="30" className="me-2" />
                    ) : (
                      <FaUserCircle className="me-2" size={20} />
                    )}
                    <span className="d-none d-md-inline">{user?.name || "Mon profil"}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/user">Mon compte</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={logout} className="text-danger">
                      <FaSignOutAlt className="me-2" /> Déconnexion
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Link to="/login" className="btn btn-gradient ms-3">
                  Connexion
                </Link>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
