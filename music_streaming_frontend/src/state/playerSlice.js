export const playerInitialState = {
  isPlaying: false,
  currentTrackId: null, // currently playing
  lastTrackId: null, // last played (for persistence)
  volume: 50, // 0 - 100
  shuffle: false,
  repeat: "off", // 'off' | 'one' | 'all'
};

/**
 * Action types (namespace 'player/')
 * - player/play
 * - player/pause
 * - player/setTrack (payload: { id })
 * - player/setVolume (payload: { volume })
 * - player/toggleShuffle
 * - player/setRepeat (payload: { mode: 'off'|'one'|'all' })
 */
export function playerReducer(state = playerInitialState, action) {
  switch (action?.type) {
    case "player/play":
      return { ...state, isPlaying: true };
    case "player/pause":
      return { ...state, isPlaying: false };
    case "player/setTrack": {
      const id = action?.payload?.id ?? null;
      return {
        ...state,
        currentTrackId: id,
        lastTrackId: id ?? state.lastTrackId,
        isPlaying: id ? state.isPlaying : false,
      };
    }
    case "player/setVolume": {
      let v = Number(action?.payload?.volume);
      if (Number.isNaN(v)) return state;
      v = Math.min(100, Math.max(0, v));
      return { ...state, volume: v };
    }
    case "player/toggleShuffle":
      return { ...state, shuffle: !state.shuffle };
    case "player/setRepeat": {
      const mode = action?.payload?.mode;
      if (!["off", "one", "all"].includes(mode)) return state;
      return { ...state, repeat: mode };
    }
    default:
      return state;
  }
}
