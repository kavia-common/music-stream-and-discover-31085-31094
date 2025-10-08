//
// utils/format.js
// Formatting helpers for time and display strings.
//

// PUBLIC_INTERFACE
export function formatTimeMMSS(totalSeconds) {
  /**
   * Format seconds to mm:ss (e.g., 65 -> "01:05").
   * Returns "--:--" for NaN/invalid inputs.
   */
  const s = Number(totalSeconds);
  if (!Number.isFinite(s) || s < 0) return "--:--";
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  const mm = String(mins).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  return `${mm}:${ss}`;
}

// PUBLIC_INTERFACE
export function formatTitle(track) {
  /**
   * Returns a human-readable track title.
   * Accepts a track object or string; falls back to "Unknown Title".
   */
  if (typeof track === "string") return track || "Unknown Title";
  if (track && typeof track.title === "string" && track.title.trim()) return track.title.trim();
  return "Unknown Title";
}

// PUBLIC_INTERFACE
export function formatArtist(track) {
  /**
   * Returns a human-readable artist name from track object.
   * Falls back to "Unknown Artist".
   */
  if (track && typeof track.artist === "string" && track.artist.trim()) return track.artist.trim();
  return "Unknown Artist";
}

// PUBLIC_INTERFACE
export function formatTitleArtist(track) {
  /**
   * Returns "Title — Artist" combined string from track metadata.
   */
  const title = formatTitle(track);
  const artist = formatArtist(track);
  return `${title} — ${artist}`;
}
