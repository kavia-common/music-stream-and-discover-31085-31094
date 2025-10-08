import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Layout components
import SidebarNav from './components/layout/SidebarNav';
import Header from './components/layout/Header';
import PlayerBar from './components/layout/PlayerBar';
import PlaylistSidebar from './components/layout/PlaylistSidebar';

// Route components (placeholders)
import Browse from './routes/Browse';
import Search from './routes/Search';
import Library from './routes/Library';
import Playlist from './routes/Playlist';
import Discover from './routes/Discover';

import { StoreProvider } from './state/store';

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
      <StoreProvider>
        <div className="app-shell">
          {/* Left Navigation Sidebar */}
          <SidebarNav onCreatePlaylist={() => { /* placeholder */ }} />

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
          <PlayerBar isPlaying={false} volume={0} />
        </div>
      </StoreProvider>
    </BrowserRouter>
  );
}

export default App;
