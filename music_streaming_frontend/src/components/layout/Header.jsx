import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Header renders the top app bar including the search field and user actions.
 * - Search input updates /search?q= param
 */
export default function Header({ placeholder = 'Search songs, artists, albums...' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState('');

  useEffect(() => {
    if (location.pathname.startsWith('/search')) {
      const p = new URLSearchParams(location.search);
      setQ(p.get('q') || '');
    } else {
      setQ('');
    }
  }, [location.pathname, location.search]);

  const goToSearch = () => {
    if (!location.pathname.startsWith('/search')) navigate('/search');
  };

  const onChange = (e) => {
    const v = e.target.value;
    setQ(v);
    const s = new URLSearchParams(location.search);
    if (v) s.set('q', v);
    else s.delete('q');
    if (!location.pathname.startsWith('/search')) {
      navigate(`/search?${s.toString()}`);
    } else {
      navigate(`/search?${s.toString()}`, { replace: true });
    }
  };

  return (
    <header className="header" role="banner" aria-label="Application header">
      <div className="search" role="search" aria-label="Search music">
        <input
          value={q}
          placeholder={placeholder}
          aria-label="Search input"
          onFocus={goToSearch}
          onChange={onChange}
        />
      </div>
      <button className="btn" type="button" aria-label="Log in">
        Log in
      </button>
    </header>
  );
}
