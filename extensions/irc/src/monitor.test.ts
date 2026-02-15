import { describe, expect, it } from "vitest";
import { resolveIrcInboundTarget } from "./monitor.js";

describe("irc monitor inbound target", () => {
  it("keeps channel target for group messages", () => {
    expect(
      resolveIrcInboundTarget({
        target: "#openhearth",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: true,
      target: "#openhearth",
      rawTarget: "#openhearth",
    });
  });

  it("maps DM target to sender nick and preserves raw target", () => {
    expect(
      resolveIrcInboundTarget({
        target: "openhearth-bot",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: false,
      target: "alice",
      rawTarget: "openhearth-bot",
    });
  });

  it("falls back to raw target when sender nick is empty", () => {
    expect(
      resolveIrcInboundTarget({
        target: "openhearth-bot",
        senderNick: " ",
      }),
    ).toEqual({
      isGroup: false,
      target: "openhearth-bot",
      rawTarget: "openhearth-bot",
    });
  });
});
