---
summary: "Hearth agent tools: member lookup, privacy checks, and context notes"
read_when:
  - Understanding what tools are available to the agent in Hearth mode
  - Checking how to query member info or privacy boundaries
title: "Tools"
---

# Hearth Tools

When Hearth is enabled, the agent gains access to specialized tools for member awareness and privacy management.

## `hearth_members`

List all members in the Hearth group.

**Parameters:** None

**Returns:**

```json
{
  "memberCount": 3,
  "members": [
    {
      "memberId": "abc-123",
      "name": "Kyle",
      "role": "owner",
      "timezone": "America/Chicago",
      "preferredChannel": "whatsapp",
      "identityCount": 2
    },
    {
      "memberId": "def-456",
      "name": "Sarah",
      "role": "member",
      "timezone": "America/New_York",
      "preferredChannel": null,
      "identityCount": 1
    }
  ]
}
```

Notes:

- Returns a summary (no full identity details) to avoid leaking channel-specific IDs in the conversation.
- Use `hearth_member_info` for detailed information about a specific member.

## `hearth_member_info`

Get detailed information about a specific member.

**Parameters:**

| Param   | Type   | Required | Description              |
| ------- | ------ | -------- | ------------------------ |
| `query` | string | Yes      | Member name or member ID |

**Returns:**

```json
{
  "memberId": "abc-123",
  "name": "Kyle",
  "role": "owner",
  "timezone": "America/Chicago",
  "preferredChannel": "whatsapp",
  "identities": [
    { "channel": "whatsapp", "id": "+15551234567" },
    { "channel": "discord", "id": "kyle#1234", "username": "kyle_d" }
  ],
  "preferences": { "language": "en" }
}
```

Notes:

- Matches by exact member ID first, then by name (case-insensitive, partial match).
- Returns full identity details including channel-specific IDs.

## `hearth_context_check`

Check the privacy boundary for a piece of information before sharing.

**Parameters:**

| Param      | Type   | Required | Description                                                |
| ---------- | ------ | -------- | ---------------------------------------------------------- |
| `content`  | string | Yes      | The content to check                                       |
| `domain`   | string | No       | Domain tag (e.g. `"health"`, `"finances"`)                 |
| `chatType` | string | No       | `"direct"`, `"group"`, or `"channel"` (default: `"group"`) |
| `groupKey` | string | No       | Group key for group-specific rules                         |

**Returns:**

```json
{
  "privacyLayer": "private",
  "canShareInGroup": false,
  "guidance": "This information is private. Do not share or attribute to any member. You may use it to inform your decisions without revealing the source.",
  "domain": "health"
}
```

Notes:

- The agent should use this tool when uncertain about whether to share information in a group context.
- Domain rules from group config are applied when a `domain` tag is provided.
- Guidance text is actionable — the agent can follow it directly.

## `hearth_context_note`

Store a scoped context note about a member with privacy tagging.

**Parameters:**

| Param          | Type   | Required | Description                                                            |
| -------------- | ------ | -------- | ---------------------------------------------------------------------- |
| `content`      | string | Yes      | The note content                                                       |
| `memberId`     | string | Yes      | Member this note is about                                              |
| `privacyLayer` | string | No       | `"public"`, `"private"` (default), `"subgroup"`, or `"agent-inferred"` |
| `domain`       | string | No       | Domain tag (e.g. `"dietary"`, `"schedule"`)                            |

**Returns:**

```json
{
  "stored": true,
  "memberId": "abc-123",
  "privacyLayer": "private",
  "domain": "dietary",
  "note": "Context note stored for member abc-123 (private, domain: dietary)"
}
```

Notes:

- Notes stored with `"private"` privacy can only be used by the agent — never shared or attributed.
- In Phase 1, notes exist within the current session context. Phase 2 adds SQLite-backed persistence with the cross-session context bridge.
- The domain tag helps the agent organize and filter context notes.

## Tool availability

Hearth tools are injected when:

1. `hearth.enabled` is `true` in config
2. The current session matches a configured Hearth group

The tools appear in the system prompt's tool listing and follow standard tool policy rules (allow/deny lists, per-sender policies).

## Related

- [Members](/hearth/members) — member model and resolution
- [Privacy](/hearth/privacy) — privacy layers and domain rules
- [Configuration](/hearth/configuration) — full config reference
