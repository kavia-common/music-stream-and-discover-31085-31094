export const playlistInitialState = {
  playlists: {}, // id -> { id, name, trackIds: [] }
  activePlaylistId: null,
  queue: [], // upcoming track ids
};

/**
 * Action types (namespace 'playlists/')
 * - playlists/create (payload: { id, name })
 * - playlists/addTrack (payload: { playlistId, trackId })
 * - playlists/removeTrack (payload: { playlistId, trackId })
 * - playlists/setActive (payload: { id })
 * - playlists/queue/set (payload: { trackIds: [] })
 * - playlists/queue/clear
 * - playlists/queue/append (payload: { trackIds: [] })
 */
export function playlistReducer(state = playlistInitialState, action) {
  switch (action?.type) {
    case "playlists/create": {
      const { id, name } = action.payload || {};
      if (!id) return state;
      const existing = state.playlists[id];
      if (existing) return state;
      return {
        ...state,
        playlists: {
          ...state.playlists,
          [id]: { id, name: name || "New Playlist", trackIds: [] },
        },
      };
    }
    case "playlists/addTrack": {
      const { playlistId, trackId } = action.payload || {};
      if (!playlistId || !trackId || !state.playlists[playlistId]) return state;
      const pl = state.playlists[playlistId];
      if (pl.trackIds.includes(trackId)) return state;
      return {
        ...state,
        playlists: {
          ...state.playlists,
          [playlistId]: { ...pl, trackIds: [...pl.trackIds, trackId] },
        },
      };
    }
    case "playlists/removeTrack": {
      const { playlistId, trackId } = action.payload || {};
      if (!playlistId || !trackId || !state.playlists[playlistId]) return state;
      const pl = state.playlists[playlistId];
      return {
        ...state,
        playlists: {
          ...state.playlists,
          [playlistId]: {
            ...pl,
            trackIds: pl.trackIds.filter((t) => t !== trackId),
          },
        },
      };
    }
    case "playlists/setActive": {
      const { id } = action.payload || {};
      return { ...state, activePlaylistId: id ?? null };
    }
    case "playlists/queue/set": {
      const arr = Array.isArray(action?.payload?.trackIds) ? action.payload.trackIds : [];
      return { ...state, queue: arr.slice() };
    }
    case "playlists/queue/clear":
      return { ...state, queue: [] };
    case "playlists/queue/append": {
      const arr = Array.isArray(action?.payload?.trackIds) ? action.payload.trackIds : [];
      return { ...state, queue: [...state.queue, ...arr] };
    }
    default:
      return state;
  }
}
