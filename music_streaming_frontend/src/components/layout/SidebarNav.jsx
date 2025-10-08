import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * SidebarNav renders the primary left navigation.
 * Presentational component with minimal state; accepts optional children (e.g., actions).
 */
export default function SidebarNav({ onCreatePlaylist }) {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand" aria-label="Application brand">
        <span className="brand-badge" aria-hidden="true" />
        WaveStream
      </div>

      <nav className="nav" aria-label="Main">
        <NavLink to="/" end aria-label="Browse">
          <span aria-hidden="true">🏠</span> Browse
        </NavLink>
        <NavLink to="/search" aria-label="Search">
          <span aria-hidden="true">🔎</span> Search
        </NavLink>
        <NavLink to="/library" aria-label="Library">
          <span aria-hidden="true">🎵</span> Library
        </NavLink>
        <NavLink to="/discover" aria-label="Discover">
          <span aria-hidden="true">✨</span> Discover
        </NavLink>
      </nav>

      <div className="hr" role="separator" aria-hidden="true" />

      <button
        className="btn"
        type="button"
        aria-label="Create new playlist"
        onClick={onCreatePlaylist}
      >
        + New Playlist
      </button>
    </aside>
  );
}
