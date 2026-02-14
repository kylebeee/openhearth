---
summary: "Hive turns OpenClaw into a group-native AI agent for families, teams, and organizations"
read_when:
  - You want OpenClaw to serve a group of people (not just one owner)
  - You need multi-party privacy, member awareness, or coordination tools
  - You want to understand the Hive architecture
title: "Hive Overview"
---

# Hive

Hive transforms OpenClaw from a personal AI assistant into a **group-native AI agent** that serves families, teams, and organizations. The agent understands group membership, respects privacy boundaries, and coordinates rather than intermediates.

## What Hive does

Without Hive, OpenClaw is a single-owner assistant. Messages from group chats are treated as generic inbound — the agent doesn't know who's who, can't track member preferences across channels, and has no privacy model for group vs. private information.

With Hive enabled, OpenClaw:

- **Knows your group** — resolves senders to named members with roles, timezones, and cross-channel identities.
- **Respects privacy** — DM content stays private; the agent can use it to inform group decisions without attribution.
- **Coordinates, doesn't intermediate** — provides structured tools (polls, schedules, checklists) instead of conversationally brokering between members.
- **Works across channels** — a member can DM via WhatsApp and participate in a Telegram group; Hive links the identity.

## Design principles

These are non-negotiable and enforced at multiple layers:

1. **Agent can aggregate/synthesize group state** — always OK.
2. **Agent relays explicit messages on direct request** — OK.
3. **Agent NEVER infers, interprets, or advocates for one member to another on its own.**
4. **The agent is infrastructure, not an intermediary** — it provides structured tools rather than conversationally brokering.
5. **Configurability is a core tenet throughout.**

## Quick start

Add a `hive` block to your `openclaw.json`:

```json5
{
  hive: {
    enabled: true,
    groups: {
      "whatsapp:group:123456@g.us": {
        name: "Trip Planning Crew",
        members: [
          {
            name: "Kyle",
            role: "owner",
            timezone: "America/Chicago",
            preferredChannel: "whatsapp",
            identities: [
              { channel: "whatsapp", id: "+15551234567" },
              { channel: "discord", id: "kyle#1234" },
            ],
          },
          {
            name: "Sarah",
            role: "member",
            timezone: "America/New_York",
            identities: [
              { channel: "whatsapp", id: "+15559876543" },
              { channel: "telegram", id: "sarah_t" },
            ],
          },
        ],
      },
    },
  },
}
```

Restart the gateway. The agent now knows about Kyle and Sarah, can resolve their messages across WhatsApp and Discord/Telegram, and follows group privacy rules.

## Feature map

| Feature                              | Phase | Status    | Docs                           |
| ------------------------------------ | ----- | --------- | ------------------------------ |
| Member identity + resolution         | 1     | Available | [Members](/hive/members)       |
| Privacy layers                       | 1     | Available | [Privacy](/hive/privacy)       |
| Communication guardrails             | 1     | Available | [Guardrails](/hive/guardrails) |
| Agent tools (member lookup, context) | 1     | Available | [Tools](/hive/tools)           |
| Cross-session context bridge         | 2     | Planned   | —                              |
| Subgroups + coordination engine      | 3     | Planned   | —                              |
| Widget/card system                   | 4     | Planned   | —                              |
| Configurable autonomy                | 5     | Planned   | [Autonomy](/hive/autonomy)     |

## Zero overhead when disabled

When `hive.enabled` is `false` or absent, the system behaves exactly like stock OpenClaw. No extra database, no extra prompt sections, no performance impact.

## Related

- [Members](/hive/members) — member model, identities, resolution
- [Privacy](/hive/privacy) — privacy layers and domain rules
- [Guardrails](/hive/guardrails) — communication principles enforcement
- [Tools](/hive/tools) — Hive agent tools
- [Configuration](/hive/configuration) — full config reference
- [Autonomy](/hive/autonomy) — per-domain autonomy levels
- [Groups](/channels/groups) — existing group chat behavior (non-Hive)
- [Multi-Agent](/concepts/multi-agent) — multi-agent routing (complementary to Hive)
