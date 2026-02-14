---
summary: "Hive member model: identities, roles, resolution, and cross-channel linking"
read_when:
  - Adding or changing Hive group members
  - Understanding how sender resolution works
  - Linking a member across multiple channels
title: "Members"
---

# Members

Hive's member model gives the agent persistent identity for every person in a group. Members are defined in config and synced to a SQLite registry at `~/.openclaw/hive/members.db`.

## Member fields

| Field              | Type   | Required | Description                                              |
| ------------------ | ------ | -------- | -------------------------------------------------------- |
| `name`             | string | Yes      | Display name                                             |
| `role`             | string | No       | `"owner"`, `"admin"`, `"member"` (default), or `"guest"` |
| `timezone`         | string | No       | IANA timezone (e.g. `"America/Chicago"`)                 |
| `preferredChannel` | string | No       | Preferred channel for DMs (e.g. `"whatsapp"`)            |
| `identities`       | array  | Yes      | Cross-channel identities (at least one)                  |
| `preferences`      | object | No       | Free-form member preferences                             |

## Identities

Each member has one or more **channel identities** that link them across messaging surfaces:

```json5
{
  identities: [
    { channel: "whatsapp", id: "+15551234567" },
    { channel: "discord", id: "kyle#1234" },
    { channel: "telegram", id: "123456789", username: "kyle_t" },
    { channel: "slack", id: "U0123ABCDEF", displayName: "Kyle B" },
  ],
}
```

| Field         | Required | Description                                                         |
| ------------- | -------- | ------------------------------------------------------------------- |
| `channel`     | Yes      | Channel provider id (`"whatsapp"`, `"telegram"`, `"discord"`, etc.) |
| `id`          | Yes      | Channel-specific user id (phone number, user id, etc.)              |
| `username`    | No       | Username on the channel                                             |
| `displayName` | No       | Display name on the channel                                         |

The `id` is the primary key for resolution. For WhatsApp and Signal, use the E.164 phone number. For Telegram, use the numeric user id. For Discord, use the Discord user id or `username#discriminator`.

## Roles

| Role     | Description                                           |
| -------- | ----------------------------------------------------- |
| `owner`  | Full control; can manage members and config           |
| `admin`  | Elevated permissions; can manage coordination         |
| `member` | Standard group member (default)                       |
| `guest`  | Limited access; may have restricted tool availability |

Roles are informational in Phase 1. The agent sees them in the system prompt and can use them for context (e.g., deferring to the owner on decisions). Future phases will wire roles into tool policy and permission gates.

## Member resolution

When a message arrives, Hive resolves the sender to a `HiveMember` using this strategy:

1. **Channel + sender id** — match `Provider` + `SenderId`/`From` against identity `channel` + `id`
2. **Channel + username** — match against identity `username`
3. **Channel + E.164** — match against identity `id` using `SenderE164`
4. **Config fallback** — if the registry has no match, search config members directly

Resolution is case-insensitive. The first match wins.

Once resolved, the following fields are set on the message context:

- `HiveMemberId` — the member's stable id
- `HiveMemberName` — display name
- `HiveMemberRole` — role string
- `HiveGroupId` — the group key
- `HivePrivacyLayer` — privacy classification for this message

These are available in templates via `{{HiveMemberId}}`, `{{HiveMemberName}}`, etc.

## Registry

Members defined in config are synced to an SQLite database at `~/.openclaw/hive/members.db` on startup. The sync is idempotent — reloading config updates existing members rather than creating duplicates. The primary identity (first in the list) is used as the stable key for matching.

The registry supports:

- `upsertMember()` — create or update a member
- `getMember(id)` — fetch by member id
- `getAllMembers()` — list all members
- `resolveByChannelIdentity(channel, id)` — resolve by channel identity
- `removeMember(id)` — delete a member

## Config example

```json5
{
  hive: {
    enabled: true,
    groups: {
      "telegram:group:-1001234567890": {
        name: "Roommates",
        members: [
          {
            name: "Alex",
            role: "owner",
            timezone: "America/Los_Angeles",
            preferredChannel: "telegram",
            identities: [
              { channel: "telegram", id: "111222333" },
              { channel: "whatsapp", id: "+15550001111" },
            ],
          },
          {
            name: "Jordan",
            role: "member",
            timezone: "America/Los_Angeles",
            identities: [{ channel: "telegram", id: "444555666" }],
            preferences: {
              language: "es",
            },
          },
        ],
      },
    },
  },
}
```

## System prompt

When Hive is enabled and a member is resolved, the system prompt includes a group roster:

```
## Hive Group Context
Group: Roommates
Members (2):
- Alex (owner) tz:America/Los_Angeles pref:telegram [current sender]
- Jordan (member) tz:America/Los_Angeles
```

The `[current sender]` tag tells the agent which member sent the current message.

## Related

- [Privacy](/hive/privacy) — how member context is scoped
- [Tools](/hive/tools) — `hive_members` and `hive_member_info` tools
- [Configuration](/hive/configuration) — full config reference
