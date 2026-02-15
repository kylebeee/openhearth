---
summary: "Full Hearth configuration reference with examples"
read_when:
  - Setting up Hearth for the first time
  - Looking up a specific config key
  - Changing privacy, autonomy, or member settings
title: "Configuration"
---

# Configuration

Hearth is configured under the `hearth` key in `openhearth.json`. When `hearth.enabled` is `false` or the `hearth` key is absent, no Hearth features are active and there is zero overhead.

## Full schema

```json5
{
  hearth: {
    // Master switch. Default: false.
    enabled: true,

    // Groups keyed by identifier.
    // Key format is flexible — use whatever identifies the group session
    // (e.g. "whatsapp:group:123@g.us", "telegram:group:-1001234567890").
    groups: {
      "<group-key>": {
        // Human-readable name (required)
        name: "Trip Planning Crew",

        // Group members
        members: [
          {
            // Display name (required)
            name: "Kyle",

            // Role: "owner" | "admin" | "member" | "guest"
            // Default: "member"
            role: "owner",

            // IANA timezone
            timezone: "America/Chicago",

            // Preferred channel for DMs
            preferredChannel: "whatsapp",

            // Cross-channel identities (at least one required)
            identities: [
              {
                channel: "whatsapp", // Channel provider id (required)
                id: "+15551234567", // Channel user id (required)
                username: "kyle_w", // Optional
                displayName: "Kyle B", // Optional
              },
              {
                channel: "discord",
                id: "kyle#1234",
              },
            ],

            // Free-form preferences
            preferences: {
              language: "en",
            },
          },
        ],

        // Privacy settings
        privacy: {
          // Default privacy layer for group context
          // "public" | "subgroup" | "private" | "agent-inferred"
          // Default: "public"
          defaultLayer: "public",

          // Domain-specific overrides
          domainRules: [
            { domain: "finances", layer: "private" },
            { domain: "health", layer: "private" },
            { domain: "relationships", layer: "private" },
          ],
        },

        // Autonomy settings (Phase 5, config accepted now)
        autonomy: {
          domains: [
            { domain: "scheduling", level: "autonomous" },
            { domain: "info-lookup", level: "autonomous" },
            { domain: "task-tracking", level: "autonomous" },
            { domain: "spending", level: "ask-first" },
            { domain: "external-comms", level: "ask-first" },
            { domain: "personal", level: "passive" },
            { domain: "conflict", level: "passive" },
          ],
        },
      },
    },
  },
}
```

## Minimal config

The smallest useful Hearth config:

```json5
{
  hearth: {
    enabled: true,
    groups: {
      "whatsapp:group:123@g.us": {
        name: "Family",
        members: [
          {
            name: "Kyle",
            identities: [{ channel: "whatsapp", id: "+15551234567" }],
          },
        ],
      },
    },
  },
}
```

## Multiple groups

You can configure multiple groups. Each group is independent — different members, different privacy rules, different autonomy settings.

```json5
{
  hearth: {
    enabled: true,
    groups: {
      "whatsapp:group:family@g.us": {
        name: "Family",
        members: [
          /* ... */
        ],
        privacy: {
          domainRules: [{ domain: "finances", layer: "private" }],
        },
      },
      "telegram:group:-1001234567890": {
        name: "Work Team",
        members: [
          /* ... */
        ],
        privacy: {
          domainRules: [
            { domain: "salary", layer: "private" },
            { domain: "performance", layer: "private" },
          ],
        },
        autonomy: {
          domains: [
            { domain: "scheduling", level: "autonomous" },
            { domain: "spending", level: "ask-first" },
          ],
        },
      },
    },
  },
}
```

## Cross-channel members

A member can appear in multiple groups with different roles:

```json5
{
  hearth: {
    enabled: true,
    groups: {
      "whatsapp:group:family@g.us": {
        name: "Family",
        members: [
          {
            name: "Kyle",
            role: "owner",
            identities: [
              { channel: "whatsapp", id: "+15551234567" },
              { channel: "telegram", id: "123456789" },
            ],
          },
        ],
      },
      "discord:guild:work-server": {
        name: "Work",
        members: [
          {
            name: "Kyle",
            role: "member",
            identities: [
              { channel: "discord", id: "kyle#1234" },
              { channel: "slack", id: "U0123ABCDEF" },
            ],
          },
        ],
      },
    },
  },
}
```

## Group key conventions

The group key is a free-form string. Recommended conventions:

| Channel  | Convention                   | Example                            |
| -------- | ---------------------------- | ---------------------------------- |
| WhatsApp | `whatsapp:group:<jid>`       | `whatsapp:group:120363099@g.us`    |
| Telegram | `telegram:group:<chat_id>`   | `telegram:group:-1001234567890`    |
| Discord  | `discord:guild:<guild_id>`   | `discord:guild:123456789012345678` |
| Slack    | `slack:channel:<channel_id>` | `slack:channel:C0123ABCDEF`        |
| Signal   | `signal:group:<group_id>`    | `signal:group:abc123def456`        |
| iMessage | `imessage:group:<chat_id>`   | `imessage:group:chat123`           |

These conventions match the session key format used internally, but the key is treated as an opaque identifier — any unique string works.

## Validation

The config is validated with Zod schemas on load. Common validation errors:

- `members[].identities` must be a non-empty array
- `privacy.defaultLayer` must be one of: `"public"`, `"subgroup"`, `"private"`, `"agent-inferred"`
- `autonomy.domains[].level` must be one of: `"passive"`, `"suggest"`, `"ask-first"`, `"autonomous"`
- `members[].role` must be one of: `"owner"`, `"admin"`, `"member"`, `"guest"`

## Storage

- Member data syncs from config to SQLite at `~/.openhearth/hearth/members.db`
- Sync is idempotent — safe to reload config without duplicating members
- The database is created automatically on first gateway start with Hearth enabled

## Related

- [Members](/hearth/members) — member model details
- [Privacy](/hearth/privacy) — privacy system
- [Autonomy](/hearth/autonomy) — autonomy levels
- [Hearth Overview](/hearth) — feature overview
