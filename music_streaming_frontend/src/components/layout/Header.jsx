import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Header renders the top app bar including the search field and user actions.
 * - Search input focuses and routes to /search on focus or input.
 */
export default function Header({ placeholder = 'Search songs, artists, albums...' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const goToSearch = () => {
    if (location.pathname !== '/search') navigate('/search');
  };

  return (
    <header className="header" role="banner" aria-label="Application header">
      <div className="search" role="search" aria-label="Search music">
        <input
          placeholder={placeholder}
          aria-label="Search input"
          onFocus={goToSearch}
          onChange={goToSearch}
        />
      </div>
      <button className="btn" type="button" aria-label="Log in">
        Log in
      </button>
    </header>
  );
}
