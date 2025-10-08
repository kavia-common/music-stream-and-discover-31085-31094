import React from 'react';
import { useParams } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function Playlist() {
  /** Playlist route placeholder - renders playlist content by id */
  const { id } = useParams();
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Playlist</h2>
      <p className="text-dim">Playlist ID: <strong>{id}</strong></p>
    </div>
  );
}
