import React, { useEffect, useState } from 'react';
import { fetchDiscovery } from '../api/discovery';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import TrackCard from '../components/common/TrackCard';
import { useStore } from '../state/store';
import useAudioPlayer from '../audio/useAudioPlayer';

// PUBLIC_INTERFACE
export default function Discover() {
  /** Discover route - personalized "For You" selection via discovery API */
  const { state, dispatch } = useStore();
  const { playTrack } = useAudioPlayer();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchDiscovery()
      .then((data) => { if (active) setTracks(data?.forYou || []); })
      .catch((e) => { if (active) setError(e?.message || 'Failed to load recommendations'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

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
      <h2 style={{ marginTop: 0 }}>Discover</h2>

      {loading && <div className="card"><LoadingSpinner label="Loading recommendations" /></div>}
      {error && !loading && <div className="card"><EmptyState title="Couldn’t load" message={error} icon="warning" /></div>}

      {!loading && !error && (
        <section className="card" aria-label="For You">
          <h3 style={{ marginTop: 0 }}>For You</h3>
          <div style={{ marginTop: 12 }}>
            {tracks.length ? tracks.map((t) => (
              <TrackCard
                key={t.id}
                track={t}
                onPlay={onPlay}
                onPause={onPause}
                isPlaying={isPlayingId === t.id}
                onAddToPlaylist={onAddToPlaylist}
              />
            )) : <EmptyState title="No recommendations yet" message="Listen to some music to get started." />}
          </div>
        </section>
      )}
    </div>
  );
}
