import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

// Layout components
import SidebarNav from './components/layout/SidebarNav';
import Header from './components/layout/Header';
import PlayerBar from './components/layout/PlayerBar';
import PlaylistSidebar from './components/layout/PlaylistSidebar';

// Route components
import Browse from './routes/Browse';
import Search from './routes/Search';
import Library from './routes/Library';
import Playlist from './routes/Playlist';
import Discover from './routes/Discover';

import { StoreProvider, useStore } from './state/store';
import { createPlaylist } from './api/playlists';

function Shell() {
  const { dispatch } = useStore();
  const navigate = useNavigate();

  const onCreatePlaylist = async () => {
    const id = `p_${Date.now()}`;
    const pl = await createPlaylist({ id, name: 'New Playlist' });
    dispatch({ type: 'playlists/create', payload: { id: pl.id, name: pl.name } });
    navigate(`/playlist/${encodeURIComponent(pl.id)}`);
  };

  return (
    <div className="app-shell">
      {/* Left Navigation Sidebar */}
      <SidebarNav onCreatePlaylist={onCreatePlaylist} />

      {/* Top Header */}
      <Header />

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
      <PlaylistSidebar title="Queue">
        <p className="text-dim">Your upcoming tracks will appear here.</p>
      </PlaylistSidebar>

      {/* Bottom Player */}
      <PlayerBar />
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /**
   * App Shell using Ocean Professional theme.
   * See Shell for wiring store and routes.
   */
  return (
    <BrowserRouter>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </BrowserRouter>
  );
}

export default App;
