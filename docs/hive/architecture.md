---
summary: "Hive internals: file layout, data flow, and extension points"
read_when:
  - Contributing to Hive development
  - Understanding how Hive integrates with OpenClaw internals
  - Debugging Hive behavior
title: "Architecture"
---

# Architecture

This page covers Hive internals for developers and contributors.

## File layout

```
src/hive/
├── members/
│   ├── types.ts          # HiveMember, HiveGroup, HiveSubgroup, MemberRole
│   ├── registry.ts       # SQLite-backed member store (HiveMemberRegistry)
│   └── resolve.ts        # resolveMember() — sender → HiveMember resolution
├── privacy/
│   ├── types.ts          # PrivacyLayer, ScopedContext, PrivacyPolicy
│   └── engine.ts         # classifyPrivacyLayer(), filterContextForMember(), scanForPrivacyViolations()
└── tools/
    ├── member-tools.ts   # hive_members, hive_member_info
    └── privacy-tools.ts  # hive_context_check, hive_context_note

src/config/
├── types.hive.ts         # HiveConfig, HiveGroupConfig, HiveMemberConfig
└── zod-schema.hive.ts    # Zod validation schemas
```

## Modified files

| File                           | Change                                        |
| ------------------------------ | --------------------------------------------- |
| `src/config/types.openclaw.ts` | Added `hive?: HiveConfig` to `OpenClawConfig` |
| `src/config/types.ts`          | Added `export * from "./types.hive.js"`       |
| `src/config/zod-schema.ts`     | Added `hive: HiveSchema` to `OpenClawSchema`  |
| `src/auto-reply/templating.ts` | Added Hive fields to `MsgContext`             |
| `src/agents/system-prompt.ts`  | Added Hive prompt sections + `hive` param     |
| `src/config/group-policy.ts`   | Added `resolveHiveMemberPolicy()`             |

## Data flow

### Inbound message

```
Message arrives
    │
    ▼
Channel adapter normalizes message → MsgContext
    │
    ▼
resolveMember(ctx, registry, hiveConfig)
    │
    ├── Match by channel + senderId?
    ├── Match by channel + senderUsername?
    ├── Match by channel + senderE164?
    └── Fall back to config matching
    │
    ▼
Set HiveMemberId, HiveMemberName, HiveMemberRole,
    HiveGroupId, HivePrivacyLayer on MsgContext
    │
    ▼
classifyPrivacyLayer(chatType, groupConfig, domain)
    │
    ▼
buildAgentSystemPrompt({ hive: { ... } })
    │
    ├── buildHiveCommunicationGuardrails()
    ├── buildHiveGroupSection(groupName, members, currentMember)
    ├── buildHivePrivacyInstructions(privacyLayer, domainRules)
    └── buildHiveAutonomySection(autonomyDomains)
    │
    ▼
Agent runs with Hive context in system prompt
    + hive_members, hive_member_info, hive_context_check, hive_context_note tools
```

### Outbound guardrail

```
Agent produces reply text
    │
    ▼
scanForPrivacyViolations(text, privateContexts, members)
    │
    ├── Check for attribution patterns (e.g. "Kyle said...")
    ├── Check for source revelation patterns
    └── Return violations[]
    │
    ▼
If violations found → flag for review / strip
If clean → deliver to channel
```

## SQLite schema

### `~/.openclaw/hive/members.db`

```sql
-- Core member data
CREATE TABLE members (
  member_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  timezone TEXT,
  preferred_channel TEXT,
  preferences TEXT,         -- JSON blob
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Cross-channel identities (unique per channel+id)
CREATE TABLE member_identities (
  member_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  username TEXT,
  display_name TEXT,
  PRIMARY KEY (channel, channel_id),
  FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
);

-- Dynamic subgroups (Phase 3)
CREATE TABLE subgroups (
  subgroup_id TEXT PRIMARY KEY,
  group_key TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Subgroup membership
CREATE TABLE subgroup_members (
  subgroup_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  PRIMARY KEY (subgroup_id, member_id)
);
```

## System prompt injection

When `hive.enabled` is true and a member is resolved, the system prompt gains these sections (injected after the Voice section, before Group Chat Context):

1. **Hive Communication Principles** — hard-coded guardrails (never overridable)
2. **Hive Group Context** — member roster with roles, timezones, current sender tag
3. **Hive Privacy Layer** — current privacy classification, domain rules
4. **Hive Autonomy Levels** — per-domain autonomy instructions

These sections are only injected in "full" prompt mode (not "minimal" for subagents or "none").

## Config sync

On gateway start (when `hive.enabled`):

1. `HiveMemberRegistry` opens/creates SQLite at `~/.openclaw/hive/members.db`
2. `syncMembersFromConfig()` iterates all groups and upserts members
3. Primary identity (first in `identities[]`) is used as the idempotent key
4. Existing members are updated in-place; new members get a fresh UUID
5. Registry is ready for `resolveByChannelIdentity()` lookups

## Extension points

### Adding a new Hive tool

1. Create the tool in `src/hive/tools/`
2. Follow the `AgentTool<Record<string, unknown>, unknown>` pattern
3. Use `readStringParam()` from `src/agents/tools/common.ts` for input parsing
4. Return via `jsonResult()` for consistent formatting
5. Register the tool in the agent runner when Hive is enabled

### Adding a new privacy domain

Domain rules are config-driven. No code changes needed — just add entries to `privacy.domainRules`:

```json5
{ domain: "my-custom-domain", layer: "private" }
```

### Adding a new autonomy domain

Same pattern — autonomy domains are config-driven:

```json5
{ domain: "my-custom-domain", level: "ask-first" }
```

## Phase roadmap

```
Phase 1 (MVP) ──► Phase 2 ──► Phase 3 ──► Phase 4
      │
      └──────────► Phase 5 (parallel)
```

| Phase | Focus                            | Key files                                                   |
| ----- | -------------------------------- | ----------------------------------------------------------- |
| 1     | Member identity + privacy layers | `src/hive/members/`, `src/hive/privacy/`, `src/hive/tools/` |
| 2     | Cross-session context bridge     | `src/hive/context/store.ts`, `src/hive/context/bridge.ts`   |
| 3     | Subgroups + coordination engine  | `src/hive/subgroups/`, `src/hive/coordination/`             |
| 4     | Widget/card system               | `src/hive/widgets/`                                         |
| 5     | Configurable autonomy evaluator  | `src/hive/autonomy/`                                        |

## Related

- [Hive Overview](/hive) — feature overview
- [Configuration](/hive/configuration) — full config reference
- [Multi-Agent](/concepts/multi-agent) — complementary multi-agent system
