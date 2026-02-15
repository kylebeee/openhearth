import { describe, expect, it } from "vitest";
import type { BrowserServerState } from "./server-context.js";
import { resolveBrowserConfig, resolveProfile } from "./config.js";
import { listKnownProfileNames } from "./server-context.js";

describe("browser server-context listKnownProfileNames", () => {
  it("includes configured and runtime-only profile names", () => {
    const resolved = resolveBrowserConfig({
      defaultProfile: "openhearth",
      profiles: {
        openhearth: { cdpPort: 18800, color: "#FF4500" },
      },
    });
    const openhearth = resolveProfile(resolved, "openhearth");
    if (!openhearth) {
      throw new Error("expected openhearth profile");
    }

    const state: BrowserServerState = {
      server: null as unknown as BrowserServerState["server"],
      port: 18791,
      resolved,
      profiles: new Map([
        [
          "stale-removed",
          {
            profile: { ...openhearth, name: "stale-removed" },
            running: null,
          },
        ],
      ]),
    };

    expect(listKnownProfileNames(state).toSorted()).toEqual([
      "chrome",
      "openhearth",
      "stale-removed",
    ]);
  });
});
