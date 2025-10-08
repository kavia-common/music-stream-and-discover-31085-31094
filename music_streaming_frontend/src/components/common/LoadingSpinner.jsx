import React from "react";
import Icon from "./Icon";

/**
 * PUBLIC_INTERFACE
 * Accessible loading spinner.
 * Props:
 * - label: string for screen readers (default "Loading")
 * - size: number | string for icon size
 * - inline: boolean, if true renders inline-flex
 */
export default function LoadingSpinner({ label = "Loading", size = 20, inline = false }) {
  return (
    <div
      className="loading-spinner"
      role="status"
      aria-live="polite"
      aria-label={label}
      style={{ display: inline ? "inline-flex" : "flex", alignItems: "center", gap: 8 }}
    >
      <Icon name="spinner" size={size} className="spinner" title={label} />
      <span className="text-dim" aria-hidden="true">
        {label}
      </span>
    </div>
  );
}
