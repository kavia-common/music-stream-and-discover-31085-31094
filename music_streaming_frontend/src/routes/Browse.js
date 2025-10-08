import React, { useEffect, useMemo, useState } from 'react';
import { fetchDiscovery } from '../api/discovery';
import { fetchTracks } from '../api/tracks';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import TrackCard from '../components/common/TrackCard';
import TrackList from '../components/common/TrackList';
import { useStore } from '../state/store';
import useAudioPlayer from '../audio/useAudioPlayer';

// PUBLIC_INTERFACE
export default function Browse() {
  /**
   * Browse shows discovery sections: Trending and New Releases
   * Uses discovery API (with mock fallback).
   * Integrates playback and add-to-playlist actions.
   */
  const { state, dispatch } = useStore();
  const { playTrack } = useAudioPlayer();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sections, setSections] = useState({ trending: [], newReleases: [] });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchDiscovery()
      .then((data) => {
        if (!active) return;
        setSections({
          trending: data?.trending || [],
          newReleases: data?.newReleases || [],
        });
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || 'Failed to load discovery');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const isPlayingId = state.player.currentTrackId;

  const onPlay = (track) => playTrack(track);
  const onPause = () => {
    // We only expose toggle via useAudioPlayer; pausing handled by player bar.
    // For simplicity, playTrack on same track toggles; otherwise ignore here.
  };
  const onAddToPlaylist = (track) => {
    // Use a default "p1" playlist if exists in mock; otherwise create a quick one.
    const playlistId = state.playlists.activePlaylistId || 'p1';
    dispatch({ type: 'playlists/create', payload: { id: playlistId, name: 'My Playlist' } });
    dispatch({ type: 'playlists/addTrack', payload: { playlistId, trackId: track.id } });
  };

  const trending = sections.trending;
  const newReleases = sections.newReleases;

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <h2 style={{ marginTop: 0 }}>Browse</h2>

      {loading && (
        <div className="card">
          <LoadingSpinner label="Loading discovery" />
        </div>
      )}

      {error && !loading && (
        <div className="card">
          <EmptyState title="Couldn’t load discovery" message={error} icon="warning" />
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="card" aria-label="Trending">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>Trending</h3>
            </div>
            <div style={{ marginTop: 12 }}>
              {trending && trending.length ? (
                trending.map((t) => (
                  <TrackCard
                    key={t.id}
                    track={t}
                    onPlay={onPlay}
                    onPause={onPause}
                    isPlaying={isPlayingId === t.id}
                    onAddToPlaylist={onAddToPlaylist}
                  />
                ))
              ) : (
                <EmptyState title="No trending tracks" message="Check back later for popular music." />
              )}
            </div>
          </section>

          <section className="card" aria-label="New Releases">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>New Releases</h3>
            </div>
            <div style={{ marginTop: 12 }}>
              {newReleases && newReleases.length ? (
                <TrackList
                  tracks={newReleases}
                  onPlay={onPlay}
                  onPause={onPause}
                  isPlayingId={isPlayingId}
                  onAddToPlaylist={onAddToPlaylist}
                />
              ) : (
                <EmptyState title="No new releases" message="Fresh tracks will appear here." />
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
