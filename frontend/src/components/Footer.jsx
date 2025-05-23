import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-light py-4">
      <div className="container text-center">
        <div className="row g-4">
          {/* Section 1: Copyright */}
          <div className="col-md-4">
            <div className="card p-3 bg-dark border-0 shadow-sm">
              <p className="mb-0">&copy; 2025 Infinity Games. Tous droits réservés.</p>
            </div>
          </div>

          {/* Section 2: Powered by */}
          <div className="col-md-4">
            <div className="card p-3 bg-dark border-0 shadow-sm">
              <p className="mb-0">
                Propulsé par{" "}
                <a 
                  href="https://rawg.io" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-info"
                >
                  RAWG.io
                </a>
              </p>
            </div>
          </div>

          {/* Section 3: Links */}
          <div className="col-md-4">
            <div className="card p-3 bg-dark border-0 shadow-sm">
              <p className="mb-0">
                <Link to="/about" className="text-info">À propos</Link> {" | "}
                <Link to="/privacy" className="text-info">Politique de confidentialité</Link> {" | "}
                <Link to="/contact" className="text-info">Contact</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Layout général pour page + footer
const Layout = ({ children }) => {
  return (
    <div className="page-container d-flex flex-column min-vh-100">
      <main className="container flex-grow-1 my-4">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
