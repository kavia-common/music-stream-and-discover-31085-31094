//
// api/client.js
// Fetch wrapper with optional API key header and base URL from env.
// Falls back to mock mode at module level; API modules should still guard by env utils.
//

import { getEnv } from "../utils/env";

/**
 * Build request headers, including JSON defaults and optional API key.
 */
function buildHeaders(extra = {}) {
  const { apiKey } = getEnv();
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...extra,
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  return headers;
}

/**
 * Internal request helper using window.fetch
 */
async function request(path, { method = "GET", body, headers } = {}) {
  const { baseUrl } = getEnv();

  if (!baseUrl) {
    throw new Error("API base URL is not configured. Enable mock mode or set REACT_APP_API_BASE_URL.");
  }

  const url = path.startsWith("http") ? path : `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

  const opts = {
    method,
    headers: buildHeaders(headers),
  };

  if (body !== undefined && body !== null) {
    opts.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const res = await fetch(url, opts);
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    const errorPayload = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => "");
    const err = new Error(`Request failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.payload = errorPayload;
    throw err;
  }

  return isJson ? res.json() : res.text();
}

// PUBLIC_INTERFACE
export function get(path, options = {}) {
  /** Perform a GET request against the configured API. */
  return request(path, { ...options, method: "GET" });
}

// PUBLIC_INTERFACE
export function post(path, body, options = {}) {
  /** Perform a POST request with JSON body against the configured API. */
  return request(path, { ...options, method: "POST", body });
}

// PUBLIC_INTERFACE
export function put(path, body, options = {}) {
  /** Perform a PUT request with JSON body against the configured API. */
  return request(path, { ...options, method: "PUT", body });
}

// PUBLIC_INTERFACE
export function del(path, options = {}) {
  /** Perform a DELETE request against the configured API. */
  return request(path, { ...options, method: "DELETE" });
}
