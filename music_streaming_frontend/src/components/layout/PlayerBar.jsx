import React from 'react';

/**
 * PUBLIC_INTERFACE
 * PlayerBar renders the bottom playback controls in a sticky bar.
 * Presentational with placeholder buttons and status.
 */
export default function PlayerBar({ isPlaying = false, volume = 0 }) {
  return (
    <footer className="player" aria-label="Player controls" role="contentinfo">
      <div className="text-dim" aria-live="polite">
        {isPlaying ? 'Playing: Track title — Artist' : 'No track playing'}
      </div>

      <div style={{ display: 'flex', gap: 8 }} aria-label="Playback controls">
        <button className="btn" type="button" aria-label="Previous track">⏮</button>
        <button
          className={`btn ${isPlaying ? '' : 'primary'}`}
          type="button"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="btn" type="button" aria-label="Next track">⏭</button>
      </div>

      <div className="badge" aria-label="Volume">
        <span className="icon-circle" aria-hidden="true">🔊</span>
        {volume}%
      </div>
    </footer>
  );
}
