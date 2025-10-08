import React, { useMemo } from "react";
import Icon from "./Icon";
import { formatTimeMMSS, formatTitle, formatArtist } from "../../utils/format";

/**
 * PUBLIC_INTERFACE
 * TrackCard displays a track tile/card with artwork, title, artist, duration, and actions.
 * Props:
 * - track: { id, title, artist|artists, artworkUrl, duration, url }
 * - onPlay: fn(track)
 * - onPause: fn(track)
 * - isPlaying: boolean (if this track is currently playing)
 * - onAddToPlaylist: fn(track)
 * - selected: boolean (optional highlight/selection style)
 * - onSelect: fn(track) optional
 * - compact: boolean (smaller layout)
 */
export default function TrackCard({
  track,
  onPlay,
  onPause,
  isPlaying = false,
  onAddToPlaylist,
  selected = false,
  onSelect,
  compact = false,
}) {
  const title = formatTitle(track);
  const artist = useMemo(() => {
    if (Array.isArray(track?.artists) && track.artists.length) {
      return track.artists.join(", ");
    }
    return formatArtist(track);
  }, [track]);
  const duration = formatTimeMMSS(track?.duration);

  const handlePlayPause = () => {
    if (!track) return;
    if (isPlaying) onPause && onPause(track);
    else onPlay && onPlay(track);
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAddToPlaylist) onAddToPlaylist(track);
  };

  const handleSelect = () => {
    onSelect && onSelect(track);
  };

  return (
    <div
      className={`track-card ${compact ? "compact" : ""} ${selected ? "selected" : ""}`}
      role="group"
      aria-label={`${title} by ${artist}`}
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter") handlePlayPause();
        if (e.key === " ") {
          e.preventDefault();
          handlePlayPause();
        }
      }}
    >
      <div className="artwork">
        {track?.artworkUrl ? (
          <img src={track.artworkUrl} alt="" aria-hidden="true" />
        ) : (
          <div className="artwork-fallback" aria-hidden="true">
            <Icon name="music" />
          </div>
        )}
        <button
          className="control playpause"
          type="button"
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={(e) => {
            e.stopPropagation();
            handlePlayPause();
          }}
        >
          <Icon name={isPlaying ? "pause" : "play"} />
        </button>
      </div>

      <div className="meta">
        <div className="title" title={title}>{title}</div>
        <div className="subtitle text-dim" title={artist}>{artist}</div>
      </div>

      <div className="right">
        <div className="duration badge" aria-label="Duration">
          <Icon name="clock" />
          {duration}
        </div>
        <button
          className="btn subtle"
          type="button"
          aria-label="Add to playlist"
          onClick={handleAdd}
        >
          <Icon name="add" />
        </button>
      </div>
    </div>
  );
}
