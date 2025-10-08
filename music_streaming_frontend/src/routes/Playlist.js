import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import TrackList from '../components/common/TrackList';
import { fetchPlaylistById, removeTrackFromPlaylist } from '../api/playlists';
import { useStore } from '../state/store';
import useAudioPlayer from '../audio/useAudioPlayer';

// PUBLIC_INTERFACE
export default function Playlist() {
  /**
   * Playlist detail page:
   * - Loads playlist by :id
   * - Lists tracks and allows play, remove, and Play All (queue)
   */
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const { playTrack } = useAudioPlayer();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playlist, setPlaylist] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    fetchPlaylistById(id)
      .then((pl) => setPlaylist(pl))
      .catch((e) => setError(e?.message || 'Failed to load playlist'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const isPlayingId = state.player.currentTrackId;
  const onPlay = (track) => playTrack(track);
  const onPause = () => {};
  const onAddToPlaylist = (track) => {
    // Adding to another playlist would open a picker; for now, add to same playlist as duplicate-protected no-op.
    dispatch({ type: 'playlists/addTrack', payload: { playlistId: id, trackId: track.id } });
  };

  const onRemove = async (track) => {
    try {
      await removeTrackFromPlaylist({ playlistId: id, trackId: track.id });
      // update local
      setPlaylist((prev) => prev ? { ...prev, tracks: (prev.tracks || []).filter((t) => t.id !== track.id) } : prev);
      dispatch({ type: 'playlists/removeTrack', payload: { playlistId: id, trackId: track.id } });
    } catch (e) {
      // ignore for mock
    }
  };

  const playAll = () => {
    const tracks = playlist?.tracks || [];
    if (!tracks.length) return;
    // queue the rest, play first
    dispatch({ type: 'playlists/queue/set', payload: { trackIds: tracks.map((t) => t.id) } });
    playTrack(tracks[0]);
  };

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      {loading && (
        <div className="card"><LoadingSpinner label="Loading playlist" /></div>
      )}
      {error && !loading && (
        <div className="card"><EmptyState title="Couldn’t load playlist" message={error} icon="warning" /></div>
      )}
      {!loading && !error && !playlist && (
        <div className="card"><EmptyState title="Playlist not found" message="It may have been removed." /></div>
      )}
      {!loading && !error && playlist && (
        <>
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: 0 }}>{playlist.name || 'Playlist'}</h2>
              <p className="text-dim" style={{ margin: 0 }}>{(playlist.tracks || []).length} tracks</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn primary" type="button" onClick={playAll}>Play All</button>
              <button className="btn" type="button" onClick={() => navigate('/library')}>Back to Library</button>
            </div>
          </div>

          <section className="card" aria-label="Tracks">
            <h3 style={{ marginTop: 0 }}>Tracks</h3>
            <div style={{ marginTop: 8 }}>
              <TrackList
                tracks={playlist.tracks || []}
                onPlay={onPlay}
                onPause={onPause}
                isPlayingId={isPlayingId}
                onAddToPlaylist={onAddToPlaylist}
                emptyFallback={<EmptyState title="No tracks" message="Add tracks to this playlist." />}
              />
              {(playlist.tracks || []).length ? (
                <p className="text-dim" style={{ marginTop: 12 }}>
                  Tip: To remove a track, open the playlist in Library and edit. (Remove action placeholder)
                </p>
              ) : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
