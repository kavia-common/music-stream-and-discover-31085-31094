import React from 'react';
import { BrowserRouter, NavLink, Routes, Route } from 'react-router-dom';
import './App.css';

// Route components (placeholders)
import Browse from './routes/Browse';
import Search from './routes/Search';
import Library from './routes/Library';
import Playlist from './routes/Playlist';
import Discover from './routes/Discover';

// PUBLIC_INTERFACE
function App() {
  /**
   * App Shell using Ocean Professional theme.
   * Layout regions:
   * - sidebar (left navigation)
   * - header (top search/actions)
   * - main (content router outlet)
   * - player (bottom now-playing bar)
   * - rightbar (playlist sidebar)
   */
  return (
    <BrowserRouter>
      <div className="app-shell">
        {/* Left Navigation Sidebar */}
        <aside className="sidebar" aria-label="Primary">
          <div className="brand">
            <span className="brand-badge" aria-hidden="true" />
            WaveStream
          </div>
          <nav className="nav">
            <NavLink to="/" end>🏠 Browse</NavLink>
            <NavLink to="/search">🔎 Search</NavLink>
            <NavLink to="/library">🎵 Library</NavLink>
            <NavLink to="/discover">✨ Discover</NavLink>
          </nav>
          <div className="hr" />
          <button className="btn">+ New Playlist</button>
        </aside>

        {/* Top Header */}
        <header className="header">
          <div className="search" role="search">
            <input placeholder="Search songs, artists, albums..." aria-label="Search" />
          </div>
          <button className="btn">Log in</button>
        </header>

        {/* Main Content - Routes */}
        <main className="main">
          <Routes>
            <Route index element={<Browse />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/playlist/:id" element={<Playlist />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="*" element={<div className="card">Not Found</div>} />
          </Routes>
        </main>

        {/* Right Playlist Sidebar */}
        <aside className="rightbar" aria-label="Playlist Sidebar">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Queue</h3>
            <p className="text-dim">Your upcoming tracks will appear here.</p>
          </div>
        </aside>

        {/* Bottom Player */}
        <footer className="player" aria-label="Player Bar">
          <div className="text-dim">No track playing</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn">⏮</button>
            <button className="btn primary">▶</button>
            <button className="btn">⏭</button>
          </div>
          <div className="badge">
            <span className="icon-circle">🔊</span>
            0%
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
