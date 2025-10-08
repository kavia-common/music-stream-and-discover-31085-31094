import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { fetchPlaylists, createPlaylist } from '../api/playlists';
import { useStore } from '../state/store';

// PUBLIC_INTERFACE
export default function Library() {
  /** Library shows user's playlists and liked tracks (placeholder) */
  const navigate = useNavigate();
  const { dispatch } = useStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playlists, setPlaylists] = useState([]);

  const load = () => {
    setLoading(true);
    setError('');
    fetchPlaylists()
      .then((pls) => setPlaylists(pls || []))
      .catch((e) => setError(e?.message || 'Failed to load library'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function onCreate() {
    try {
      const id = `p_${Date.now()}`;
      const pl = await createPlaylist({ id, name: 'New Playlist' });
      dispatch({ type: 'playlists/create', payload: { id: pl.id, name: pl.name } });
      navigate(`/playlist/${encodeURIComponent(pl.id)}`);
    } catch (e) {
      // ignore errors for mock
    }
  }

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Library</h2>
        <button className="btn primary" onClick={onCreate} type="button">+ New Playlist</button>
      </div>

      {loading && (
        <div className="card"><LoadingSpinner label="Loading library" /></div>
      )}
      {error && !loading && (
        <div className="card"><EmptyState title="Couldn’t load library" message={error} icon="warning" /></div>
      )}

      {!loading && !error && (
        <>
          <section className="card" aria-label="Playlists">
            <h3 style={{ marginTop: 0 }}>Playlists</h3>
            <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
              {playlists.length ? playlists.map((pl) => (
                <div key={pl.id} className="track-card compact" style={{ cursor: 'pointer' }} onClick={() => navigate(`/playlist/${encodeURIComponent(pl.id)}`)}>
                  <div className="artwork" aria-hidden="true">
                    <div className="artwork-fallback">🎵</div>
                  </div>
                  <div className="meta">
                    <div className="title">{pl.name}</div>
                    <div className="subtitle text-dim">{pl.trackCount ?? 0} tracks</div>
                  </div>
                  <div className="right">
                    <button className="btn" type="button" onClick={(e) => { e.stopPropagation(); navigate(`/playlist/${encodeURIComponent(pl.id)}`); }}>Open</button>
                  </div>
                </div>
              )) : <EmptyState title="No playlists yet" message="Create your first playlist." actionLabel="New Playlist" onAction={onCreate} />}
            </div>
          </section>

          <section className="card" aria-label="Liked songs">
            <h3 style={{ marginTop: 0 }}>Liked Songs</h3>
            <p className="text-dim" style={{ margin: 0 }}>Like songs to see them here. (Coming soon)</p>
          </section>
        </>
      )}
    </div>
  );
}
