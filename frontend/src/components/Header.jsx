import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  Form,
  Button,
  InputGroup,
  Spinner,
  Image,
  Dropdown,
  Collapse,
} from "react-bootstrap";
import { FaTimes, FaSearch, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import logo from "../assets/images/logo2.svg";
import { useGames } from "../providers/GameProvider";
import { AuthContext } from "../providers/AuthProvider";

const Header = () => {
  const { isAuthenticated, isAdmin, isUser, logout, user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const { searchResults, handleSearch } = useGames();
  const searchRef = useRef(null);
  const navigate = useNavigate();

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
      setShowSearchMobile(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header>
      <Navbar expand="lg" bg="dark" variant="dark" className="py-3">
        <Container fluid>
          <div className="d-flex w-100 justify-content-between align-items-center flex-wrap">
            {/* LEFT: Logo + Navigation */}
            <div className="d-flex align-items-center">
              <Navbar.Brand as={Link} to="/" className="me-4">
                <img src={logo} alt="Logo" height="60" />
              </Navbar.Brand>

              <Nav className="d-none d-lg-flex">
                <Nav.Link as={Link} to="/games">Bibliothèque</Nav.Link>
                <Nav.Link as={Link} to="/forum">Forum</Nav.Link>
                {isUser && (
                  <>
                    <Nav.Link as={Link} to="/recommandation">Jeux recommandés</Nav.Link>
                    <Nav.Link as={Link} to="/similar-games">Jeux similaires</Nav.Link>
                  </>
                )}
                {isAdmin && (
                  <Nav.Link as={Link} to="/admin" className="text-danger">
                    Administration
                  </Nav.Link>
                )}
              </Nav>
            </div>

            {/* RIGHT: Search + User */}
            <div className="d-flex align-items-center ms-auto mt-3 mt-lg-0" style={{ gap: "1rem" }}>
              {/* Mobile Search Toggle */}
              <Button
                variant="outline-light"
                className="d-lg-none"
                onClick={() => setShowSearchMobile((prev) => !prev)}
              >
                <FaSearch />
              </Button>

              {/* Desktop Search */}
              <Form
                ref={searchRef}
                className="d-none d-lg-block"
                style={{ position: "relative", width: "300px" }}
                onSubmit={(e) => e.preventDefault()}
              >
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Rechercher un jeu"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <InputGroup.Text onClick={clearSearch} style={{ cursor: "pointer" }}>
                      <FaTimes />
                    </InputGroup.Text>
                  )}
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                </InputGroup>

                {showResults && searchQuery && (
                  <div
                    className="bg-dark text-light shadow-sm"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 1050,
                      maxHeight: "300px",
                      overflowY: "auto",
                      border: "1px solid #6c757d",
                      borderTop: "none",
                    }}
                  >
                    {loadingSearch ? (
                      <div className="text-center p-3">
                        <Spinner animation="border" size="sm" variant="light" />
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="px-3 py-2 text-muted">Aucun résultat</div>
                    ) : (
                      searchResults.map((result, idx) => (
                        <div
                          key={idx}
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

              {/* User Dropdown */}
              {isAuthenticated ? (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="outline-light" className="d-flex align-items-center">
                    {user?.avatarUrl ? (
                      <Image src={user.avatarUrl} roundedCircle width="30" height="30" className="me-2" />
                    ) : (
                      <FaUserCircle className="me-2" size={20} />
                    )}
                    <span className="d-none d-md-inline">{user?.name || "Profil"}</span>
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
                <Link to="/login" className="btn btn-outline-light">
                  Connexion
                </Link>
              )}
            </div>
          </div>

          {/* Collapse Search on mobile */}
          <Collapse in={showSearchMobile}>
            <div className="mt-3 d-lg-none" ref={searchRef}>
              <Form onSubmit={(e) => e.preventDefault()} style={{ position: "relative" }}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Rechercher un jeu"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <InputGroup.Text onClick={clearSearch} style={{ cursor: "pointer" }}>
                      <FaTimes />
                    </InputGroup.Text>
                  )}
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                </InputGroup>

                {showResults && searchQuery && (
                  <div
                    className="bg-dark text-light shadow-sm"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 1050,
                      maxHeight: "300px",
                      overflowY: "auto",
                      border: "1px solid #6c757d",
                      borderTop: "none",
                    }}
                  >
                    {loadingSearch ? (
                      <div className="text-center p-3">
                        <Spinner animation="border" size="sm" variant="light" />
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="px-3 py-2 text-muted">Aucun résultat</div>
                    ) : (
                      searchResults.map((result, idx) => (
                        <div
                          key={idx}
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
            </div>
          </Collapse>

          {/* Navigation mobile */}
          <Navbar.Toggle aria-controls="navbar-nav" className="mt-3" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="flex-column d-lg-none">
              <Nav.Link as={Link} to="/games">Bibliothèque</Nav.Link>
              <Nav.Link as={Link} to="/forum">Forum</Nav.Link>
              {isUser && (
                <>
                  <Nav.Link as={Link} to="/recommandation">Jeux recommandés</Nav.Link>
                  <Nav.Link as={Link} to="/similar-games">Jeux similaires</Nav.Link>
                </>
              )}
              {isAdmin && (
                <Nav.Link as={Link} to="/admin" className="text-danger">Administration</Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
