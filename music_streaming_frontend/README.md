# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Environment configuration

The app reads the following env variables (Create React App-style), all optional:

- `REACT_APP_API_BASE_URL`: Base URL for the backend API (e.g., https://api.example.com)
- `REACT_APP_API_KEY`: Optional API key; sent as `Authorization: Bearer <key>`
- `REACT_APP_USE_MOCK`: If `true`, the app uses local mock fixtures for API calls (default true if base URL missing)
- `REACT_APP_ENABLE_ANALYTICS`: Feature flag for analytics (not used yet)

Example `.env`:

```
REACT_APP_API_BASE_URL=https://api.example.com
REACT_APP_API_KEY=your-key
REACT_APP_USE_MOCK=false
REACT_APP_ENABLE_ANALYTICS=false
```

If `REACT_APP_API_BASE_URL` is missing, the app automatically falls back to mock mode.

## API Client and Mock Data

- API helpers live in `src/api/client.js` and expose `get`, `post`, `put`, `del`.
- Domain APIs are provided:
  - `src/api/tracks.js`
  - `src/api/playlists.js`
  - `src/api/discovery.js`
- Mock fixtures: `src/api/mock/fixtures.json` (includes a few public-domain audio URLs).
  - When mock mode is enabled, these modules resolve Promises from the fixtures without network calls.

## Customization

### Colors

The main brand colors are defined as CSS variables. See `src/theme/oceanTheme.css`.

### Components

This template uses pure HTML/CSS components instead of a UI framework. You can find component styles in `src/App.css`.

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
