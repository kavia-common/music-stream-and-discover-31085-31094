//
// api/discovery.js
// Discovery and recommendation endpoints with mock fallback.
//

import { getEnv } from "../utils/env";
import { get } from "./client";
import { fetchTracks } from "./tracks";

// PUBLIC_INTERFACE
export async function fetchDiscovery() {
  /**
   * Returns discovery sections:
   * {
   *   trending: Track[],
   *   newReleases: Track[],
   *   forYou: Track[]
   * }
   */
  const { useMock } = getEnv();
  if (useMock) {
    const mod = await import("./mock/fixtures.json");
    const data = mod.default || mod;
    const ids = {
      trending: data.discover?.trending || [],
      newReleases: data.discover?.newReleases || [],
      forYou: data.discover?.forYou || [],
    };

    const [trending, newReleases, forYou] = await Promise.all([
      fetchTracks({ ids: ids.trending }),
      fetchTracks({ ids: ids.newReleases }),
      fetchTracks({ ids: ids.forYou }),
    ]);

    return { trending, newReleases, forYou };
  }

  const payload = await get("/discovery");
  // If backend returns ids, expand via tracks API; otherwise pass through.
  if (payload && payload.trending && Array.isArray(payload.trending) && typeof payload.trending[0] === "string") {
    const [trending, newReleases, forYou] = await Promise.all([
      fetchTracks({ ids: payload.trending }),
      fetchTracks({ ids: payload.newReleases || [] }),
      fetchTracks({ ids: payload.forYou || [] }),
    ]);
    return { trending, newReleases, forYou };
  }
  return payload;
}
