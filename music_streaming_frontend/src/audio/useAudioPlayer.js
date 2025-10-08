/**
 * useAudioPlayer
 * React hook that creates a singleton AudioEngine instance and wires it up to the global store.
 * Exposes playback state and controls:
 * - State: isPlaying, position, duration, volume (0..100 UI scale), buffered
 * - Controls: togglePlay, seekTo(seconds), setVolume(0..100), playTrack(track)
 *
 * It handles:
 * - Resuming the AudioContext on first user gesture via play()
 * - Short fade-in/fade-out handled inside AudioEngine
 */
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import AudioEngine from "./AudioEngine";
import { useStore } from "../state/store";

// Singleton engine (per module)
let engineSingleton = null;

// PUBLIC_INTERFACE
export default function useAudioPlayer() {
  /**
   * Hook returning playback state and control handlers.
   * Integrates with existing player slice for isPlaying and volume persistence.
   */
  const { state, dispatch } = useStore();

  // Ensure single engine instance
  const engine = useMemo(() => {
    if (!engineSingleton) {
      engineSingleton = new AudioEngine({ fadeMs: 200, fftSize: 1024 });
    }
    return engineSingleton;
  }, []);

  // Local reactive state
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(NaN);
  const [buffered, setBuffered] = useState(0);

  // Keep a ref of mounted state to avoid state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Don't dispose the singleton on unmount of a single consumer.
      // If desired, expose a separate cleanup in app root.
    };
  }, []);

  // Wire time/analyser subscriptions
  useEffect(() => {
    const offTime = engine.onTimeUpdate((cur, dur, buf) => {
      if (!mountedRef.current) return;
      setPosition(cur || 0);
      setDuration(Number.isFinite(dur) ? dur : NaN);
      setBuffered(buf || 0);
    });

    // We don't expose analyser data here, but hook consumers can register directly if needed.

    return () => {
      offTime && offTime();
    };
  }, [engine]);

  // Sync engine volume with global state volume (0..100)
  useEffect(() => {
    const volLinear = (state.player.volume ?? 100) / 100;
    engine.setVolume(volLinear);
  }, [engine, state.player.volume]);

  // Controls
  const togglePlay = useCallback(async () => {
    if (engine.audio?.src) {
      if (engine.audio.paused) {
        await engine.play();
        dispatch({ type: "player/play" });
      } else {
        await engine.pause();
        dispatch({ type: "player/pause" });
      }
    }
  }, [dispatch, engine]);

  const seekTo = useCallback(
    (seconds) => {
      engine.seek(seconds);
    },
    [engine]
  );

  const setVolume = useCallback(
    (v) => {
      const clamped = Math.max(0, Math.min(100, Number(v)));
      dispatch({ type: "player/setVolume", payload: { volume: clamped } });
      // engine volume will be synced by the effect above
    },
    [dispatch]
  );

  const playTrack = useCallback(
    async (track) => {
      /**
       * track: { id, url, ...metadata }
       * Loads and starts playback of the provided track.
      */
      if (!track || !track.url) return;
      await engine.load(track.url, track);
      dispatch({ type: "player/setTrack", payload: { id: track.id ?? null } });
      await engine.play();
      dispatch({ type: "player/play" });
    },
    [dispatch, engine]
  );

  // Derive isPlaying from engine state for real-time accuracy
  const isPlaying = !!engine.audio && !engine.audio.paused;

  // Expose API
  return {
    // state
    isPlaying,
    position,
    duration,
    volume: state.player.volume ?? 100,
    buffered,

    // controls
    togglePlay,
    seekTo,
    setVolume,
    playTrack,

    // advanced: expose engine for analyzer bindings if needed (not part of acceptance API)
    _engine: engine,
  };
}
