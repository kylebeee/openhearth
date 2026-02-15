import { describe, expect, it } from "vitest";
import {
  buildParseArgv,
  getFlagValue,
  getCommandPath,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  shouldMigrateState,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it("detects help/version flags", () => {
    expect(hasHelpOrVersion(["node", "openhearth", "--help"])).toBe(true);
    expect(hasHelpOrVersion(["node", "openhearth", "-V"])).toBe(true);
    expect(hasHelpOrVersion(["node", "openhearth", "status"])).toBe(false);
  });

  it("extracts command path ignoring flags and terminator", () => {
    expect(getCommandPath(["node", "openhearth", "status", "--json"], 2)).toEqual(["status"]);
    expect(getCommandPath(["node", "openhearth", "agents", "list"], 2)).toEqual(["agents", "list"]);
    expect(getCommandPath(["node", "openhearth", "status", "--", "ignored"], 2)).toEqual([
      "status",
    ]);
  });

  it("returns primary command", () => {
    expect(getPrimaryCommand(["node", "openhearth", "agents", "list"])).toBe("agents");
    expect(getPrimaryCommand(["node", "openhearth"])).toBeNull();
  });

  it("parses boolean flags and ignores terminator", () => {
    expect(hasFlag(["node", "openhearth", "status", "--json"], "--json")).toBe(true);
    expect(hasFlag(["node", "openhearth", "--", "--json"], "--json")).toBe(false);
  });

  it("extracts flag values with equals and missing values", () => {
    expect(getFlagValue(["node", "openhearth", "status", "--timeout", "5000"], "--timeout")).toBe(
      "5000",
    );
    expect(getFlagValue(["node", "openhearth", "status", "--timeout=2500"], "--timeout")).toBe(
      "2500",
    );
    expect(getFlagValue(["node", "openhearth", "status", "--timeout"], "--timeout")).toBeNull();
    expect(getFlagValue(["node", "openhearth", "status", "--timeout", "--json"], "--timeout")).toBe(
      null,
    );
    expect(getFlagValue(["node", "openhearth", "--", "--timeout=99"], "--timeout")).toBeUndefined();
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "openhearth", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "openhearth", "status", "--debug"])).toBe(false);
    expect(
      getVerboseFlag(["node", "openhearth", "status", "--debug"], { includeDebug: true }),
    ).toBe(true);
  });

  it("parses positive integer flag values", () => {
    expect(getPositiveIntFlagValue(["node", "openhearth", "status"], "--timeout")).toBeUndefined();
    expect(
      getPositiveIntFlagValue(["node", "openhearth", "status", "--timeout"], "--timeout"),
    ).toBeNull();
    expect(
      getPositiveIntFlagValue(["node", "openhearth", "status", "--timeout", "5000"], "--timeout"),
    ).toBe(5000);
    expect(
      getPositiveIntFlagValue(["node", "openhearth", "status", "--timeout", "nope"], "--timeout"),
    ).toBeUndefined();
  });

  it("builds parse argv from raw args", () => {
    const nodeArgv = buildParseArgv({
      programName: "openhearth",
      rawArgs: ["node", "openhearth", "status"],
    });
    expect(nodeArgv).toEqual(["node", "openhearth", "status"]);

    const versionedNodeArgv = buildParseArgv({
      programName: "openhearth",
      rawArgs: ["node-22", "openhearth", "status"],
    });
    expect(versionedNodeArgv).toEqual(["node-22", "openhearth", "status"]);

    const versionedNodeWindowsArgv = buildParseArgv({
      programName: "openhearth",
      rawArgs: ["node-22.2.0.exe", "openhearth", "status"],
    });
    expect(versionedNodeWindowsArgv).toEqual(["node-22.2.0.exe", "openhearth", "status"]);

    const versionedNodePatchlessArgv = buildParseArgv({
      programName: "openhearth",
      rawArgs: ["node-22.2", "openhearth", "status"],
    });
    expect(versionedNodePatchlessArgv).toEqual(["node-22.2", "openhearth", "status"]);

    const versionedNodeWindowsPatchlessArgv = buildParseArgv({
      programName: "openhearth",
      rawArgs: ["node-22.2.exe", "openhearth", "status"],
    });
    expect(versionedNodeWindowsPatchlessArgv).toEqual(["node-22.2.exe", "openhearth", "status"]);

    const versionedNodeWithPathArgv = buildParseArgv({
      programName: "openhearth",
      rawArgs: ["/usr/bin/node-22.2.0", "openhearth", "status"],
    });
    expect(versionedNodeWithPathArgv).toEqual(["/usr/bin/node-22.2.0", "openhearth", "status"]);

    const nodejsArgv = buildParseArgv({
      programName: "openhearth",
      rawArgs: ["nodejs", "openhearth", "status"],
    });
    expect(nodejsArgv).toEqual(["nodejs", "openhearth", "status"]);

    const nonVersionedNodeArgv = buildParseArgv({
      programName: "openhearth",
      rawArgs: ["node-dev", "openhearth", "status"],
    });
    expect(nonVersionedNodeArgv).toEqual([
      "node",
      "openhearth",
      "node-dev",
      "openhearth",
      "status",
    ]);

    const directArgv = buildParseArgv({
      programName: "openhearth",
      rawArgs: ["openhearth", "status"],
    });
    expect(directArgv).toEqual(["node", "openhearth", "status"]);

    const bunArgv = buildParseArgv({
      programName: "openhearth",
      rawArgs: ["bun", "src/entry.ts", "status"],
    });
    expect(bunArgv).toEqual(["bun", "src/entry.ts", "status"]);
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "openhearth",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "openhearth", "status"]);
  });

  it("decides when to migrate state", () => {
    expect(shouldMigrateState(["node", "openhearth", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "openhearth", "health"])).toBe(false);
    expect(shouldMigrateState(["node", "openhearth", "sessions"])).toBe(false);
    expect(shouldMigrateState(["node", "openhearth", "config", "get", "update"])).toBe(false);
    expect(shouldMigrateState(["node", "openhearth", "config", "unset", "update"])).toBe(false);
    expect(shouldMigrateState(["node", "openhearth", "models", "list"])).toBe(false);
    expect(shouldMigrateState(["node", "openhearth", "models", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "openhearth", "memory", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "openhearth", "agent", "--message", "hi"])).toBe(false);
    expect(shouldMigrateState(["node", "openhearth", "agents", "list"])).toBe(true);
    expect(shouldMigrateState(["node", "openhearth", "message", "send"])).toBe(true);
  });

  it("reuses command path for migrate state decisions", () => {
    expect(shouldMigrateStateFromPath(["status"])).toBe(false);
    expect(shouldMigrateStateFromPath(["config", "get"])).toBe(false);
    expect(shouldMigrateStateFromPath(["models", "status"])).toBe(false);
    expect(shouldMigrateStateFromPath(["agents", "list"])).toBe(true);
  });
});
