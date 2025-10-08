import React, { useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * PlaylistSidebar renders a collapsible right sidebar (e.g., queue, playlists).
 * Keeps minimal local state for collapse/expand only.
 */
export default function PlaylistSidebar({ title = 'Queue', children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="rightbar"
      aria-label="Playlist Sidebar"
      aria-expanded={!collapsed}
    >
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h3>
          <button
            className="btn"
            type="button"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed(v => !v)}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        {!collapsed ? (
          children ?? (
            <p className="text-dim">Your upcoming tracks will appear here.</p>
          )
        ) : (
          <p className="text-dim" aria-live="polite">Collapsed</p>
        )}
      </div>
    </aside>
  );
}
