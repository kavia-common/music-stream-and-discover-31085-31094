import React from "react";
import Icon from "./Icon";

/**
 * PUBLIC_INTERFACE
 * EmptyState renders a friendly placeholder with Ocean styling.
 * Props:
 * - title: string
 * - message: string
 * - actionLabel: optional string
 * - onAction: optional function
 * - icon: optional icon name (defaults to 'empty')
 */
export default function EmptyState({ title, message, actionLabel, onAction, icon = "empty" }) {
  return (
    <div className="empty-state card" role="note" aria-live="polite">
      <div className="empty-illustration">
        <div className="icon-circle" aria-hidden="true" style={{ width: 56, height: 56 }}>
          <Icon name={icon} size={28} />
        </div>
      </div>
      <h3 style={{ margin: "8px 0 4px" }}>{title}</h3>
      <p className="text-dim" style={{ margin: 0 }}>{message}</p>
      {actionLabel && typeof onAction === "function" ? (
        <div style={{ marginTop: 12 }}>
          <button className="btn primary" type="button" onClick={onAction}>
            {actionLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
