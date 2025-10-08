//
// api/tracks.js
// Tracks data access with mock fallback.
//

import { getEnv } from "../utils/env";
import { get } from "./client";

// Lazy-loaded fixtures cache
let fixturesCache = null;

async function loadFixtures() {
  if (fixturesCache) return fixturesCache;
  const mod = await import("./mock/fixtures.json");
  fixturesCache = mod.default || mod;
  return fixturesCache;
}

function mapTrackFixture(t) {
  // Normalize fixture track to app shape: include url alias for streaming
  return {
    id: t.id,
    title: t.title,
    artist: t.artist,
    album: t.album,
    duration: t.duration,
    url: t.streamingUrl,
    streamingUrl: t.streamingUrl,
    artworkUrl: t.artworkUrl,
  };
}

// PUBLIC_INTERFACE
export async function fetchTrackById(id) {
  /**
   * Fetch a single track by id.
   * In mock mode, resolves from fixtures.
   */
  const { useMock } = getEnv();
  if (useMock) {
    const data = await loadFixtures();
    const track = (data.tracks || []).find((x) => x.id === id);
    return track ? mapTrackFixture(track) : null;
  }
  const data = await get(`/tracks/${encodeURIComponent(id)}`);
  return {
    ...data,
    url: data.url || data.streamingUrl,
  };
}

// PUBLIC_INTERFACE
export async function fetchTracks(params = {}) {
  /**
   * Fetch list of tracks with optional query params.
   * In mock mode, returns all fixtures (ignores params other than ids).
   * Supported params in mock: ids: string[] (filter by ids)
   */
  const { useMock } = getEnv();
  if (useMock) {
    const data = await loadFixtures();
    let arr = (data.tracks || []).map(mapTrackFixture);
    if (Array.isArray(params.ids) && params.ids.length) {
      const set = new Set(params.ids);
      arr = arr.filter((t) => set.has(t.id));
    }
    return arr;
  }

  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v == null) return;
    if (Array.isArray(v)) v.forEach((x) => qs.append(k, x));
    else qs.set(k, v);
  });
  const query = qs.toString();
  const path = query ? `/tracks?${query}` : "/tracks";
  const list = await get(path);
  return list.map((t) => ({ ...t, url: t.url || t.streamingUrl }));
}
