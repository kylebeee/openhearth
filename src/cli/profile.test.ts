import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "openhearth",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "openhearth", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "openhearth", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "openhearth", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "openhearth", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "openhearth", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "openhearth", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it("rejects combining --dev with --profile (dev first)", () => {
    const res = parseCliProfileArgs(["node", "openhearth", "--dev", "--profile", "work", "status"]);
    expect(res.ok).toBe(false);
  });

  it("rejects combining --dev with --profile (profile first)", () => {
    const res = parseCliProfileArgs(["node", "openhearth", "--profile", "work", "--dev", "status"]);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".openhearth-dev");
    expect(env.OPENHEARTH_PROFILE).toBe("dev");
    expect(env.OPENHEARTH_STATE_DIR).toBe(expectedStateDir);
    expect(env.OPENHEARTH_CONFIG_PATH).toBe(path.join(expectedStateDir, "openhearth.json"));
    expect(env.OPENHEARTH_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      OPENHEARTH_STATE_DIR: "/custom",
      OPENHEARTH_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.OPENHEARTH_STATE_DIR).toBe("/custom");
    expect(env.OPENHEARTH_GATEWAY_PORT).toBe("19099");
    expect(env.OPENHEARTH_CONFIG_PATH).toBe(path.join("/custom", "openhearth.json"));
  });

  it("uses OPENHEARTH_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      OPENHEARTH_HOME: "/srv/openhearth-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/openhearth-home");
    expect(env.OPENHEARTH_STATE_DIR).toBe(path.join(resolvedHome, ".openhearth-work"));
    expect(env.OPENHEARTH_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".openhearth-work", "openhearth.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it("returns command unchanged when no profile is set", () => {
    expect(formatCliCommand("openhearth doctor --fix", {})).toBe("openhearth doctor --fix");
  });

  it("returns command unchanged when profile is default", () => {
    expect(formatCliCommand("openhearth doctor --fix", { OPENHEARTH_PROFILE: "default" })).toBe(
      "openhearth doctor --fix",
    );
  });

  it("returns command unchanged when profile is Default (case-insensitive)", () => {
    expect(formatCliCommand("openhearth doctor --fix", { OPENHEARTH_PROFILE: "Default" })).toBe(
      "openhearth doctor --fix",
    );
  });

  it("returns command unchanged when profile is invalid", () => {
    expect(formatCliCommand("openhearth doctor --fix", { OPENHEARTH_PROFILE: "bad profile" })).toBe(
      "openhearth doctor --fix",
    );
  });

  it("returns command unchanged when --profile is already present", () => {
    expect(
      formatCliCommand("openhearth --profile work doctor --fix", { OPENHEARTH_PROFILE: "work" }),
    ).toBe("openhearth --profile work doctor --fix");
  });

  it("returns command unchanged when --dev is already present", () => {
    expect(formatCliCommand("openhearth --dev doctor", { OPENHEARTH_PROFILE: "dev" })).toBe(
      "openhearth --dev doctor",
    );
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("openhearth doctor --fix", { OPENHEARTH_PROFILE: "work" })).toBe(
      "openhearth --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(
      formatCliCommand("openhearth doctor --fix", { OPENHEARTH_PROFILE: "  jbopenhearth  " }),
    ).toBe("openhearth --profile jbopenhearth doctor --fix");
  });

  it("handles command with no args after openhearth", () => {
    expect(formatCliCommand("openhearth", { OPENHEARTH_PROFILE: "test" })).toBe(
      "openhearth --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm openhearth doctor", { OPENHEARTH_PROFILE: "work" })).toBe(
      "pnpm openhearth --profile work doctor",
    );
  });
});
