import React from 'react';
import { useStore } from '../../state/store';
import useAudioPlayer from '../../audio/useAudioPlayer';
import { formatTitleArtist } from '../../utils/format';

/**
 * PUBLIC_INTERFACE
 * PlayerBar renders the bottom playback controls with actual state and controls.
 */
export default function PlayerBar() {
  const { state, dispatch } = useStore();
  const { isPlaying, togglePlay, setVolume, volume } = useAudioPlayer();

  const title = state.player.currentTrackId ? `Playing — Track ${state.player.currentTrackId}` : 'No track playing';

  return (
    <footer className="player" aria-label="Player controls" role="contentinfo">
      <div className="text-dim" aria-live="polite">
        {title}
      </div>

      <div style={{ display: 'flex', gap: 8 }} aria-label="Playback controls">
        <button className="btn" type="button" aria-label="Previous track" onClick={() => { /* future: previous from queue */ }}>⏮</button>
        <button
          className={`btn ${isPlaying ? '' : 'primary'}`}
          type="button"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onClick={togglePlay}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="btn" type="button" aria-label="Next track" onClick={() => { /* future: next from queue */ }}>⏭</button>
      </div>

      <div className="badge" aria-label="Volume" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="icon-circle" aria-hidden="true">🔊</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={volume}
          aria-label="Volume slider"
          onChange={(e) => setVolume(Number(e.target.value))}
        />
        {volume}%
      </div>
    </footer>
  );
}
