import { describe, expect, it } from "vitest";
import { shouldSkipRespawnForArgv } from "./respawn-policy.js";

describe("shouldSkipRespawnForArgv", () => {
  it("skips respawn for help/version calls", () => {
    expect(shouldSkipRespawnForArgv(["node", "openhearth", "--help"])).toBe(true);
    expect(shouldSkipRespawnForArgv(["node", "openhearth", "-V"])).toBe(true);
  });

  it("keeps respawn path for normal commands", () => {
    expect(shouldSkipRespawnForArgv(["node", "openhearth", "status"])).toBe(false);
  });
});
