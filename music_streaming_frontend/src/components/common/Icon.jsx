import React from "react";

/**
 * PUBLIC_INTERFACE
 * Icon renders inline SVGs by name with Ocean Professional styling via currentColor.
 * Props:
 * - name: one of ['play','pause','add','music','clock','empty','spinner','more','check','warning','search','heart','plus','minus']
 * - size: number (px) or string (defaults to 20)
 * - className: optional class
 * - title: accessible title (optional; if omitted, uses name)
 */
export default function Icon({ name, size = 20, className = "", title }) {
  const sz = typeof size === "number" ? `${size}px` : size || "20px";
  const label = title || name;
  const common = {
    width: sz,
    height: sz,
    viewBox: "0 0 24 24",
    role: "img",
    "aria-label": label,
    focusable: "false",
    xmlns: "http://www.w3.org/2000/svg",
    className,
  };

  switch (name) {
    case "play":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M8 5v14l11-7z" />
        </svg>
      );
    case "pause":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z" />
        </svg>
      );
    case "add":
    case "plus":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2z" />
        </svg>
      );
    case "minus":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M5 11h14v2H5z" />
        </svg>
      );
    case "music":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M12 3v10.55A4 4 0 1 1 10 9V6h8V3h-6z" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm1 5h-2v6l5 3 .999-1.732L13 12.5V7z" />
        </svg>
      );
    case "empty":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M4 5h16v2H4zm2 4h12v10H6z" />
        </svg>
      );
    case "spinner":
      return (
        <svg {...common} viewBox="0 0 50 50">
          <title>{label}</title>
          <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.2" />
          <path d="M45 25a20 20 0 0 0-20-20" stroke="currentColor" strokeWidth="5" fill="none">
            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
          </path>
        </svg>
      );
    case "more":
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="19" cy="12" r="2" fill="currentColor" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
        </svg>
      );
    case "warning":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M21 20l-5.6-5.6A7 7 0 1 0 9.4 16.4L15 22l6-2zM5 10a5 5 0 1 1 10 0 5 5 0 0 1-10 0z" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M12 21s-7-4.35-9.33-8.39C.61 9.04 2.36 5 6.4 5c2.02 0 3.2 1.03 3.6 1.5.4-.47 1.58-1.5 3.6-1.5 4.04 0 5.79 4.04 3.73 7.61C19 16.65 12 21 12 21z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect width="18" height="18" x="3" y="3" rx="4" fill="currentColor" />
        </svg>
      );
  }
}
