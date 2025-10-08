//
// api/playlists.js
// Playlist data access with mock fallback and minimal mutation simulation in-memory.
//

import { getEnv } from "../utils/env";
import { get, post, put, del } from "./client";
import { fetchTracks } from "./tracks";

// Local mutable cache for mock mutations (does not persist)
let mockState = null;

async function ensureMockState() {
  if (!mockState) {
    const mod = await import("./mock/fixtures.json");
    const data = mod.default || mod;
    mockState = {
      playlists: (data.playlists || []).map((p) => ({ ...p, trackIds: [...(p.trackIds || [])] })),
      tracks: (data.tracks || []).slice(),
    };
  }
  return mockState;
}

// PUBLIC_INTERFACE
export async function fetchPlaylists() {
  /**
   * Returns an array of playlists.
   */
  const { useMock } = getEnv();
  if (useMock) {
    const state = await ensureMockState();
    return state.playlists.map((p) => ({ ...p, trackCount: p.trackIds.length }));
  }
  return get("/playlists");
}

// PUBLIC_INTERFACE
export async function fetchPlaylistById(id) {
  /**
   * Returns playlist details and expanded tracks list.
   */
  const { useMock } = getEnv();
  if (useMock) {
    const state = await ensureMockState();
    const pl = state.playlists.find((p) => p.id === id);
    if (!pl) return null;
    const tracks = await fetchTracks({ ids: pl.trackIds });
    return { ...pl, tracks };
  }
  return get(`/playlists/${encodeURIComponent(id)}`);
}

// PUBLIC_INTERFACE
export async function createPlaylist({ id, name }) {
  /**
   * Create a playlist. In mock mode, updates in-memory state.
   */
  const { useMock } = getEnv();
  if (useMock) {
    const state = await ensureMockState();
    const existing = state.playlists.find((p) => p.id === id);
    if (existing) return existing;
    const pl = { id: id || `p_${Date.now()}`, name: name || "New Playlist", trackIds: [] };
    state.playlists.push(pl);
    return pl;
  }
  return post("/playlists", { id, name });
}

// PUBLIC_INTERFACE
export async function addTrackToPlaylist({ playlistId, trackId }) {
  /**
   * Add a track to playlist. In mock mode, updates in-memory state.
   */
  const { useMock } = getEnv();
  if (useMock) {
    const state = await ensureMockState();
    const pl = state.playlists.find((p) => p.id === playlistId);
    if (!pl) throw new Error("Playlist not found");
    if (!pl.trackIds.includes(trackId)) pl.trackIds.push(trackId);
    return { ...pl };
  }
  return put(`/playlists/${encodeURIComponent(playlistId)}/tracks`, { trackId });
}

// PUBLIC_INTERFACE
export async function removeTrackFromPlaylist({ playlistId, trackId }) {
  /**
   * Remove a track from playlist. In mock mode, updates in-memory state.
   */
  const { useMock } = getEnv();
  if (useMock) {
    const state = await ensureMockState();
    const pl = state.playlists.find((p) => p.id === playlistId);
    if (!pl) throw new Error("Playlist not found");
    pl.trackIds = pl.trackIds.filter((id) => id !== trackId);
    return { ...pl };
  }
  return del(`/playlists/${encodeURIComponent(playlistId)}/tracks/${encodeURIComponent(trackId)}`);
}
