import React from "react";
import Icon from "./Icon";
import { formatTimeMMSS, formatTitle, formatArtist } from "../../utils/format";

/**
 * PUBLIC_INTERFACE
 * TrackList renders a compact list of tracks with hover actions.
 * Props:
 * - tracks: Array<track>
 * - onPlay: fn(track)
 * - onPause: fn(track)
 * - isPlayingId: id of the currently playing track (optional)
 * - onAddToPlaylist: fn(track)
 * - selectable: boolean (adds selected style on click)
 * - selectedId: selected track id (optional)
 * - onSelect: fn(track)
 * - emptyFallback: optional React node when list is empty
 */
export default function TrackList({
  tracks = [],
  onPlay,
  onPause,
  isPlayingId = null,
  onAddToPlaylist,
  selectable = false,
  selectedId = null,
  onSelect,
  emptyFallback = null,
}) {
  if (!tracks || tracks.length === 0) {
    return (
      emptyFallback || (
        <div className="card">
          <p className="text-dim" style={{ margin: 0 }}>No tracks available.</p>
        </div>
      )
    );
  }

  return (
    <div className="track-list" role="list" aria-label="Track list">
      {tracks.map((track) => {
        const isPlaying = isPlayingId != null && track?.id === isPlayingId;
        const title = formatTitle(track);
        const artist = Array.isArray(track?.artists) && track.artists.length
          ? track.artists.join(", ")
          : formatArtist(track);
        const duration = formatTimeMMSS(track?.duration);
        const selected = selectable && selectedId === track?.id;

        const onRowClick = () => onSelect && onSelect(track);

        return (
          <div
            key={track?.id || title}
            className={`track-row ${selected ? "selected" : ""}`}
            role="listitem"
            tabIndex={0}
            aria-label={`${title} by ${artist}`}
            onClick={onRowClick}
            onKeyDown={(e) => {
              if (e.key === "Enter") (isPlaying ? onPause : onPlay) && (isPlaying ? onPause(track) : onPlay(track));
              if (e.key === " ") {
                e.preventDefault();
                (isPlaying ? onPause : onPlay) && (isPlaying ? onPause(track) : onPlay(track));
              }
            }}
          >
            <button
              className={`icon-btn play ${isPlaying ? "active" : ""}`}
              type="button"
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={(e) => {
                e.stopPropagation();
                if (isPlaying) onPause && onPause(track);
                else onPlay && onPlay(track);
              }}
            >
              <Icon name={isPlaying ? "pause" : "play"} />
            </button>

            <div className="thumb" aria-hidden="true">
              {track?.artworkUrl ? (
                <img src={track.artworkUrl} alt="" />
              ) : (
                <div className="artwork-fallback">
                  <Icon name="music" />
                </div>
              )}
            </div>

            <div className="info">
              <div className="title" title={title}>{title}</div>
              <div className="subtitle text-dim" title={artist}>{artist}</div>
            </div>

            <div className="spacer" />

            <div className="duration text-dim">{duration}</div>

            <button
              className="icon-btn add"
              type="button"
              aria-label="Add to playlist"
              onClick={(e) => {
                e.stopPropagation();
                onAddToPlaylist && onAddToPlaylist(track);
              }}
            >
              <Icon name="add" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
