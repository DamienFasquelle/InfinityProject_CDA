import React from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

const SearchResults = ({ searchResults, loading, searchQuery }) => {
  return (
    <div className="search-results-container" >
      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="primary" size="sm" />
        </div>
      ) : (
        <>
          {searchResults.length > 0 ? (
            searchResults.map((game) => (
              <Link
                key={game.id}
                to={`/game/${game.id}`}
                style={{
                  display: 'block',
                  padding: '5px',
                  textDecoration: 'none',
                  color: 'black',
                  borderBottom: '1px solid #ddd',
                }}
              >
                {game.name}
              </Link>
            ))
          ) : (
            <p style={{ padding: '5px', color: '#888' }}>Aucun jeu trouvé</p>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
