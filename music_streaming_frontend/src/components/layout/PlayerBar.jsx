import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../../state/store';
import useAudioPlayer from '../../audio/useAudioPlayer';
import { formatTimeMMSS } from '../../utils/format';

/**
 * PUBLIC_INTERFACE
 * PlayerBar renders the bottom playback controls with actual state and controls.
 * Keyboard shortcuts (when the PlayerBar has focus):
 * - Space: Play/Pause
 * - Ctrl+Right / Ctrl+Left: Next / Previous
 * - Ctrl+Up / Ctrl+Down or +/-: Volume up/down
 * - Shift+Right / Shift+Left: Seek +10s / -10s
 */
export default function PlayerBar() {
  const { state, dispatch } = useStore();
  const {
    isPlaying,
    togglePlay,
    setVolume,
    volume,
    position,
    duration,
    seekTo,
    _engine,
  } = useAudioPlayer();

  // Derive now playing label (mock uses id)
  const nowPlayingLabel = useMemo(() => {
    if (state.player.currentTrackId) {
      return `Playing — Track ${state.player.currentTrackId}`;
    }
    return 'No track playing';
  }, [state.player.currentTrackId]);

  // Queue helpers (mock-level next/prev by queue in playlists slice)
  const queue = state.playlists.queue || [];
  const currentId = state.player.currentTrackId;
  const currentIndex = useMemo(() => queue.indexOf(currentId), [queue, currentId]);

  const next = useCallback(() => {
    if (!queue.length) return;
    let idx = currentIndex >= 0 ? currentIndex + 1 : 0;
    if (idx >= queue.length) {
      // repeat all: restart, else stop
      if (state.player.repeat === 'all') idx = 0;
      else return;
    }
    const nextId = queue[idx];
    dispatch({ type: 'playlists/queue/set', payload: { trackIds: queue } });
    dispatch({ type: 'player/setTrack', payload: { id: nextId } });
  }, [queue, currentIndex, state.player.repeat, dispatch]);

  const prev = useCallback(() => {
    if (!queue.length) return;
    let idx = currentIndex >= 0 ? currentIndex - 1 : queue.length - 1;
    if (idx < 0) {
      if (state.player.repeat === 'all') idx = queue.length - 1;
      else return;
    }
    const prevId = queue[idx];
    dispatch({ type: 'playlists/queue/set', payload: { trackIds: queue } });
    dispatch({ type: 'player/setTrack', payload: { id: prevId } });
  }, [queue, currentIndex, state.player.repeat, dispatch]);

  // Shuffle/repeat toggles
  const toggleShuffle = () => dispatch({ type: 'player/toggleShuffle' });
  const cycleRepeat = () => {
    const mode = state.player.repeat;
    const nextMode = mode === 'off' ? 'one' : mode === 'one' ? 'all' : 'off';
    dispatch({ type: 'player/setRepeat', payload: { mode: nextMode } });
  };

  // Volume helpers
  const changeVolumeBy = (delta) => {
    const v = Math.max(0, Math.min(100, volume + delta));
    setVolume(v);
  };

  // Seek helpers (+/- seconds)
  const seekBy = (deltaSeconds) => {
    const target = Math.max(
      0,
      Math.min(Number.isFinite(duration) ? duration : Number.MAX_SAFE_INTEGER, position + deltaSeconds)
    );
    seekTo(target);
  };

  // When track id changes via next/prev, try to auto-load if engine has metadata with same id
  // In this mock, routes call playTrack; here we ensure play/pause button reflects engine state via isPlaying.

  // Keyboard shortcuts when bar focused
  const containerRef = useRef(null);
  const onKeyDown = (e) => {
    // Prevent scrolling on space when focused here
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
      return;
    }
    // Ctrl + Arrows for track
    if (e.ctrlKey && e.key === 'ArrowRight') {
      e.preventDefault();
      next();
      return;
    }
    if (e.ctrlKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
      return;
    }
    // Ctrl + Up/Down or +/- for volume
    if (e.ctrlKey && e.key === 'ArrowUp') {
      e.preventDefault();
      changeVolumeBy(5);
      return;
    }
    if (e.ctrlKey && e.key === 'ArrowDown') {
      e.preventDefault();
      changeVolumeBy(-5);
      return;
    }
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      changeVolumeBy(5);
      return;
    }
    if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      changeVolumeBy(-5);
      return;
    }
    // Shift + left/right for seek
    if (e.shiftKey && e.key === 'ArrowRight') {
      e.preventDefault();
      seekBy(10);
      return;
    }
    if (e.shiftKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      seekBy(-10);
      return;
    }
  };

  // Sync global play/pause with engine events (ended -> auto next if repeat/all)
  useEffect(() => {
    if (!_engine?.audio) return;
    const onEnded = () => {
      // If repeat one, restart same track
      if (state.player.repeat === 'one') {
        const cur = _engine.getCurrentTime();
        const dur = _engine.getDuration();
        // If duration is valid, loop to 0
        if (Number.isFinite(dur)) {
          seekTo(0);
          _engine.play();
          return;
        }
      }
      // otherwise go next (respect repeat all via next())
      next();
    };
    _engine.audio.addEventListener('ended', onEnded);
    return () => {
      _engine.audio.removeEventListener('ended', onEnded);
    };
  }, [_engine, next, seekTo, state.player.repeat]);

  // Accessible labels/state strings
  const playPauseLabel = isPlaying ? 'Pause' : 'Play';
  const volPercent = `${volume}%`;
  const posLabel = `${formatTimeMMSS(position)} of ${formatTimeMMSS(duration)}`;

  // compute controlled slider values safely to avoid warnings
  const timelineMax = Number.isFinite(duration) ? Math.max(0, Math.floor(duration)) : 0;
  const timelineValue = Number.isFinite(duration)
    ? Math.max(0, Math.min(Math.floor(position), Math.floor(duration)))
    : 0;

  return (
    <footer
      className="player"
      aria-label="Player controls"
      role="contentinfo"
      tabIndex={0}
      ref={containerRef}
      onKeyDown={onKeyDown}
    >
      {/* Now Playing section */}
      <div className="text-dim" aria-live="polite" aria-atomic="true">
        {nowPlayingLabel}
      </div>

      {/* Transport controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} aria-label="Playback controls" role="group">
        <button
          className="btn subtle"
          type="button"
          aria-label="Shuffle"
          aria-pressed={state.player.shuffle}
          onClick={toggleShuffle}
        >
          🔀
        </button>

        <button className="btn" type="button" aria-label="Previous track" onClick={prev}>⏮</button>

        <button
          className={`btn ${isPlaying ? '' : 'primary'}`}
          type="button"
          aria-label={playPauseLabel}
          onClick={togglePlay}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button className="btn" type="button" aria-label="Next track" onClick={next}>⏭</button>

        <button
          className="btn subtle"
          type="button"
          aria-label={`Repeat mode: ${state.player.repeat}`}
          onClick={cycleRepeat}
        >
          {state.player.repeat === 'one' ? '🔁1' : state.player.repeat === 'all' ? '🔁' : '➡️'}
        </button>
      </div>

      {/* Time slider + labels */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 280 }} aria-label="Timeline" role="group">
        <span className="text-dim" aria-hidden="true" style={{ width: 44, textAlign: 'right' }}>
          {formatTimeMMSS(position)}
        </span>
        <input
          className="range"
          type="range"
          min="0"
          max={timelineMax}
          step="1"
          value={timelineValue}
          aria-label="Seek slider"
          onChange={(e) => seekTo(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span className="text-dim" aria-hidden="true" style={{ width: 44 }}>
          {formatTimeMMSS(duration)}
        </span>
        <span className="sr-only" aria-live="off">{posLabel}</span>
      </div>

      {/* Volume */}
      <div className="badge" aria-label={`Volume ${volPercent}`} role="group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="icon-circle" aria-hidden="true">🔊</span>
        <input
          className="range"
          type="range"
          min="0"
          max="100"
          step="1"
          value={volume}
          aria-label="Volume slider"
          onChange={(e) => setVolume(Number(e.target.value))}
        />
        <span aria-hidden="true">{volPercent}</span>
      </div>
    </footer>
  );
}
