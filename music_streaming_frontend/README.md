# Lightweight React Template for KAVIA

Modern React single‑page app styled with the Ocean Professional theme. It includes routing, global state, a minimal audio engine (Web Audio API), and a mockable API layer.

## Getting Started

From this folder:

- npm start — run the app in development
- npm test — run tests in watch mode
- npm run build — production build

Open http://localhost:3000 after starting.

## Environment Configuration

All variables use Create React App semantics (must be prefixed with REACT_APP_). You can define them in a local .env file.

- REACT_APP_API_BASE_URL: Base URL of the backend API, e.g. https://api.example.com
- REACT_APP_API_KEY: Optional API key; sent as Authorization: Bearer <key>
- REACT_APP_USE_MOCK: When true, use local mock fixtures for API calls
- REACT_APP_ENABLE_ANALYTICS: Feature flag for optional analytics (not used yet)

Behavior:
- If REACT_APP_API_BASE_URL is missing, the app automatically falls back to mock mode.
- Explicitly set REACT_APP_USE_MOCK=true to force mock mode even if a base URL is provided.

Example .env:

REACT_APP_API_BASE_URL=https://api.example.com
REACT_APP_API_KEY=your-key
REACT_APP_USE_MOCK=false
REACT_APP_ENABLE_ANALYTICS=false

## Mock Mode vs Real API

- Mock mode (default): No network calls. All data comes from src/api/mock/fixtures.json.
  - To enable: omit REACT_APP_API_BASE_URL or set REACT_APP_USE_MOCK=true
- Real API mode: Network calls go to REACT_APP_API_BASE_URL with optional Bearer token.
  - To enable: set REACT_APP_API_BASE_URL and REACT_APP_USE_MOCK=false (or leave unset)

Switching modes requires restarting the dev server for env changes to take effect.

## Keyboard Shortcuts (PlayerBar)

Shortcuts are active when the PlayerBar has focus (Tab to the bottom bar to focus it):

- Space: Toggle Play/Pause
- Ctrl + Right / Ctrl + Left: Next / Previous track
- Ctrl + Up / Ctrl + Down: Volume up/down (5%)
- + / -: Volume up/down (5%)
- Shift + Right / Shift + Left: Seek forward/backward 10 seconds

## Running Tests

- Smoke tests render all main routes and simulate a user gesture before any audio playback to satisfy autoplay restrictions in jsdom.
- Audio and Web Audio APIs are stubbed in src/setupTests.js.

Commands:

- npm test — runs in watch mode
- CI=true npm test — single run suitable for CI

## Project Structure Highlights

- src/App.js — app shell, routing, layout
- src/state/* — minimal context + reducers
- src/audio/AudioEngine.js — no-dependency audio wrapper over Web Audio API
- src/api/* — API client and domain modules (mock-aware)
- src/routes/* — pages: Browse (/), Search (/search), Library (/library), Playlist (/playlist/:id), Discover (/discover)
- src/__tests__/app.smoke.test.jsx — route and audio smoke tests

## API Client and Mock Data

- Fetch wrapper: src/api/client.js (get/post/put/del)
- Domain APIs: tracks.js, playlists.js, discovery.js
- Mock fixtures: src/api/mock/fixtures.json

When mock mode is enabled, API modules resolve from fixtures without network calls.

## Customization

- Theme tokens: src/theme/oceanTheme.css
- Global styles and components: src/App.css and src/components/*
- Utilities: src/utils/*
