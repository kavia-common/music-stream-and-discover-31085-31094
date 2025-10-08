import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { playerInitialState, playerReducer } from "./playerSlice";
import { playlistInitialState, playlistReducer } from "./playlistSlice";
import { uiInitialState, uiReducer } from "./uiSlice";

/**
 * Minimal global state container using React Context + useReducer.
 * Slices:
 * - player: playback related state (volume, lastTrackId, shuffle, repeat)
 * - playlists: playlists data and queue
 * - ui: UI-related flags (sidebar collapsed)
 *
 * LocalStorage persistence:
 * - volume (number)
 * - lastTrackId (string|null)
 * - shuffle (boolean)
 * - repeat (string: 'off' | 'one' | 'all')
 * - ui.sidebarCollapsed (boolean)
 */

// Keys for localStorage
const LS_KEYS = {
  volume: "app_player_volume",
  lastTrackId: "app_player_last_track_id",
  shuffle: "app_player_shuffle",
  repeat: "app_player_repeat",
  sidebarCollapsed: "app_ui_sidebar_collapsed",
};

// Safely read from localStorage
function lsGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

// Safely write to localStorage
function lsSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

// Hydrate initial state from localStorage
function hydrateInitialState() {
  const hydratedPlayer = { ...playerInitialState };
  const hydratedUI = { ...uiInitialState };

  const vol = lsGet(LS_KEYS.volume);
  const lastId = lsGet(LS_KEYS.lastTrackId);
  const shuffle = lsGet(LS_KEYS.shuffle);
  const repeat = lsGet(LS_KEYS.repeat);
  const sidebarCollapsed = lsGet(LS_KEYS.sidebarCollapsed);

  if (vol !== null) {
    const n = Number(vol);
    if (!Number.isNaN(n)) hydratedPlayer.volume = Math.min(100, Math.max(0, n));
  }
  if (lastId !== null) {
    hydratedPlayer.lastTrackId = lastId || null;
  }
  if (shuffle !== null) {
    hydratedPlayer.shuffle = shuffle === "true";
  }
  if (repeat !== null && ["off", "one", "all"].includes(repeat)) {
    hydratedPlayer.repeat = repeat;
  }
  if (sidebarCollapsed !== null) {
    hydratedUI.sidebarCollapsed = sidebarCollapsed === "true";
  }

  return {
    player: hydratedPlayer,
    playlists: { ...playlistInitialState },
    ui: hydratedUI,
  };
}

// Combined reducer that routes actions to the correct slice reducer based on action.type prefix
function rootReducer(state, action) {
  // Expect action types in the form: 'player/xyz', 'playlists/xyz', 'ui/xyz'
  if (typeof action?.type !== "string") return state;

  const [slice] = action.type.split("/");
  switch (slice) {
    case "player":
      return { ...state, player: playerReducer(state.player, action) };
    case "playlists":
      return { ...state, playlists: playlistReducer(state.playlists, action) };
    case "ui":
      return { ...state, ui: uiReducer(state.ui, action) };
    default:
      // Unknown action type: no state change
      return state;
  }
}

const StoreContext = createContext(null);

// PUBLIC_INTERFACE
export function StoreProvider({ children }) {
  /**
   * Provides global app state via Context.
   * - Initializes from localStorage
   * - Persists select fields to localStorage on change
   */
  const initial = useMemo(() => hydrateInitialState(), []);
  const [state, dispatch] = useReducer(rootReducer, initial);

  // Persist specific fields to localStorage as they change
  // Using refs to avoid writing on initial render if values haven't changed.
  const lastPersisted = useRef({
    volume: state.player.volume,
    lastTrackId: state.player.lastTrackId,
    shuffle: state.player.shuffle,
    repeat: state.player.repeat,
    sidebarCollapsed: state.ui.sidebarCollapsed,
  });

  useEffect(() => {
    if (lastPersisted.current.volume !== state.player.volume) {
      lsSet(LS_KEYS.volume, String(state.player.volume));
      lastPersisted.current.volume = state.player.volume;
    }
    if (lastPersisted.current.lastTrackId !== state.player.lastTrackId) {
      lsSet(LS_KEYS.lastTrackId, state.player.lastTrackId ?? "");
      lastPersisted.current.lastTrackId = state.player.lastTrackId;
    }
    if (lastPersisted.current.shuffle !== state.player.shuffle) {
      lsSet(LS_KEYS.shuffle, String(state.player.shuffle));
      lastPersisted.current.shuffle = state.player.shuffle;
    }
    if (lastPersisted.current.repeat !== state.player.repeat) {
      lsSet(LS_KEYS.repeat, String(state.player.repeat));
      lastPersisted.current.repeat = state.player.repeat;
    }
    if (lastPersisted.current.sidebarCollapsed !== state.ui.sidebarCollapsed) {
      lsSet(LS_KEYS.sidebarCollapsed, String(state.ui.sidebarCollapsed));
      lastPersisted.current.sidebarCollapsed = state.ui.sidebarCollapsed;
    }
  }, [state.player.volume, state.player.lastTrackId, state.player.shuffle, state.player.repeat, state.ui.sidebarCollapsed]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// PUBLIC_INTERFACE
export function useStore() {
  /** Hook to access { state, dispatch } from the global store */
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}
