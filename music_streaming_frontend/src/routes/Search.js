import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import TrackList from '../components/common/TrackList';
import { fetchTracks } from '../api/tracks';
import { useStore } from '../state/store';
import useAudioPlayer from '../audio/useAudioPlayer';

// PUBLIC_INTERFACE
export default function Search() {
  /** Search route - uses ?q= query, filters mock tracks by title/artist */
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const { playTrack } = useAudioPlayer();

  const params = new URLSearchParams(location.search);
  const [q, setQ] = useState(params.get('q') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const next = p.get('q') || '';
    setQ(next);
  }, [location.search]);

  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      setError('');
      try {
        // In mock mode, fetch all then filter client-side; live API may support q param
        const list = await fetchTracks();
        const needle = (q || '').trim().toLowerCase();
        const res = needle
          ? list.filter(
              (t) =>
                t.title?.toLowerCase().includes(needle) ||
                t.artist?.toLowerCase().includes(needle)
            )
          : [];
        if (active) setResults(res);
      } catch (e) {
        if (active) setError(e?.message || 'Search failed');
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => { active = false; };
  }, [q]);

  const onSubmit = (e) => {
    e.preventDefault();
    const v = new FormData(e.currentTarget).get('q') || '';
    const s = new URLSearchParams(location.search);
    if (v) s.set('q', v);
    else s.delete('q');
    navigate(`/search?${s.toString()}`);
  };

  const isPlayingId = state.player.currentTrackId;
  const onPlay = (track) => playTrack(track);
  const onPause = () => {};
  const onAddToPlaylist = (track) => {
    const playlistId = state.playlists.activePlaylistId || 'p1';
    dispatch({ type: 'playlists/create', payload: { id: playlistId, name: 'My Playlist' } });
    dispatch({ type: 'playlists/addTrack', payload: { playlistId, trackId: track.id } });
  };

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <h2 style={{ marginTop: 0 }}>Search</h2>

      <form className="card" onSubmit={onSubmit} role="search" aria-label="Search songs">
        <div className="search">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search songs, artists..."
            aria-label="Search query"
          />
          <button className="btn primary" type="submit">Search</button>
        </div>
      </form>

      {loading && (
        <div className="card">
          <LoadingSpinner label="Searching" />
        </div>
      )}

      {error && !loading && (
        <div className="card">
          <EmptyState title="Search error" message={error} icon="warning" />
        </div>
      )}

      {!loading && !error && (
        <section className="card" aria-label="Results">
          <h3 style={{ marginTop: 0 }}>Results</h3>
          <div style={{ marginTop: 8 }}>
            <TrackList
              tracks={results}
              onPlay={onPlay}
              onPause={onPause}
              isPlayingId={isPlayingId}
              onAddToPlaylist={onAddToPlaylist}
              emptyFallback={<EmptyState title="No results" message="Try a different search." />}
            />
          </div>
        </section>
      )}
    </div>
  );
}
