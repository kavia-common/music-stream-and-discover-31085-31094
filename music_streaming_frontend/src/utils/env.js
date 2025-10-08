//
// utils/env.js
// Centralized environment variable access for the frontend.
//

/**
 * Read boolean-like environment flag from process.env
 */
function readBool(val) {
  if (typeof val !== "string") return false;
  const v = val.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

/**
 * Safe accessor for process.env in CRA at build-time.
 */
function getRawEnv() {
  return {
    REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "",
    REACT_APP_API_KEY: process.env.REACT_APP_API_KEY || "",
    REACT_APP_USE_MOCK: process.env.REACT_APP_USE_MOCK || "",
    REACT_APP_ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS || "",
  };
}

// PUBLIC_INTERFACE
export function getEnv() {
  /**
   * Returns normalized environment configuration object:
   * - baseUrl: string ('' if missing)
   * - apiKey: string ('' if missing)
   * - useMock: boolean (true if REACT_APP_USE_MOCK is 'true' or baseUrl missing)
   * - enableAnalytics: boolean
   */
  const raw = getRawEnv();
  const baseUrl = String(raw.REACT_APP_API_BASE_URL || "").trim();
  const apiKey = String(raw.REACT_APP_API_KEY || "").trim();
  const enableAnalytics = readBool(raw.REACT_APP_ENABLE_ANALYTICS);
  const requestedMock = readBool(raw.REACT_APP_USE_MOCK);

  const useMock = requestedMock || !baseUrl;

  return { baseUrl, apiKey, useMock, enableAnalytics };
}

// PUBLIC_INTERFACE
export function assertApiConfigured() {
  /**
   * Throws if API is not configured and mock is not enabled.
   * Use this in code paths that require live API access.
   */
  const { baseUrl, useMock } = getEnv();
  if (!useMock && !baseUrl) {
    throw new Error("API not configured: set REACT_APP_API_BASE_URL or enable REACT_APP_USE_MOCK=true.");
  }
}
