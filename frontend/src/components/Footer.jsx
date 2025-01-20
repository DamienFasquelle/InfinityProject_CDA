import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-light py-4">
      <div className="container text-center">
        <div className="row">
          <div className="col-md-4 mb-3">
            <p>&copy; 2025 Infinity Games. Tous droits réservés.</p>
          </div>
          <div className="col-md-4 mb-3">
            <p>Propulsé par <a href="https://rawg.io" target="_blank" rel="noopener noreferrer" className="text-info">RAWG.io</a></p>
          </div>
          <div className="col-md-4 mb-3">
            <p>
              <Link to="/about" className="text-info">À propos</Link> | 
              <Link to="/privacy" className="text-info"> Politique de confidentialité</Link> | 
              <Link to="/contact" className="text-info"> Contact</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="page-container">
      <div className="container">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
