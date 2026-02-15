import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveGatewayStateDir } from "./paths.js";

describe("resolveGatewayStateDir", () => {
  it("uses the default state dir when no overrides are set", () => {
    const env = { HOME: "/Users/test" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".openhearth"));
  });

  it("appends the profile suffix when set", () => {
    const env = { HOME: "/Users/test", OPENHEARTH_PROFILE: "rescue" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".openhearth-rescue"));
  });

  it("treats default profiles as the base state dir", () => {
    const env = { HOME: "/Users/test", OPENHEARTH_PROFILE: "Default" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".openhearth"));
  });

  it("uses OPENHEARTH_STATE_DIR when provided", () => {
    const env = { HOME: "/Users/test", OPENHEARTH_STATE_DIR: "/var/lib/openhearth" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/var/lib/openhearth"));
  });

  it("expands ~ in OPENHEARTH_STATE_DIR", () => {
    const env = { HOME: "/Users/test", OPENHEARTH_STATE_DIR: "~/openhearth-state" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/Users/test/openhearth-state"));
  });

  it("preserves Windows absolute paths without HOME", () => {
    const env = { OPENHEARTH_STATE_DIR: "C:\\State\\openhearth" };
    expect(resolveGatewayStateDir(env)).toBe("C:\\State\\openhearth");
  });
});
