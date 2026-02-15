---
summary: "Hearth privacy layers: public, subgroup, private, and agent-inferred context scoping"
read_when:
  - Understanding how Hearth handles private vs public information
  - Configuring domain-specific privacy rules
  - Checking how DM content is protected in group contexts
title: "Privacy"
---

# Privacy

Hearth's privacy system controls how context flows between conversations. It ensures DM content stays private while still allowing the agent to make informed group decisions.

## Privacy layers

Every piece of context has a privacy layer:

| Layer            | Default for | Description                                                            |
| ---------------- | ----------- | ---------------------------------------------------------------------- |
| `public`         | Group chat  | Visible to all group members                                           |
| `subgroup`       | —           | Visible only to members of a specific subgroup                         |
| `private`        | DMs         | Visible only to the source member and the agent                        |
| `agent-inferred` | —           | Synthesized by the agent; can be used in aggregate without attribution |

## How it works

Privacy is classified automatically based on chat type:

- **DM** → `private` by default
- **Group chat** → `public` by default
- **Domain override** → config rules can override the default for specific topics

### Example flow

1. Kyle DMs the agent: "I'm allergic to shellfish" → classified as `private`
2. In the group chat, someone asks the agent to plan dinner
3. The agent uses Kyle's allergy info to suggest restaurants without shellfish
4. The agent **never** says "Kyle is allergic to shellfish" — it just makes good suggestions

This is the core principle: private context informs decisions, but is never attributed.

## Domain rules

You can configure privacy rules for specific domains (topics). This overrides the default layer for matching content.

```json5
{
  hearth: {
    groups: {
      "whatsapp:group:123@g.us": {
        name: "Family",
        privacy: {
          defaultLayer: "public",
          domainRules: [
            { domain: "finances", layer: "private" },
            { domain: "health", layer: "private" },
            { domain: "relationships", layer: "private" },
            { domain: "schedule", layer: "public" },
          ],
        },
      },
    },
  },
}
```

With this config:

- General group chat → `public` (default)
- Financial discussions → `private` (even in group chat)
- Health information → `private`
- Schedule coordination → `public`

## Privacy enforcement

Privacy is enforced at four layers (not just the prompt):

### 1. Prompt layer

Hard-coded communication guardrails are injected into the system prompt. These are never overridable by config or user instructions. See [Guardrails](/hearth/guardrails).

### 2. Context bridge layer (Phase 2)

When the cross-session context bridge is active, private context is filtered before reaching the agent's context window. The agent never sees raw private data from other sessions — only pre-filtered, privacy-safe summaries.

### 3. Tool layer (Phase 3+)

Privacy checks run before any message relay tool executes. The `hearth_context_check` tool lets the agent verify privacy boundaries before sharing information.

### 4. Post-processing layer

Outbound messages are scanned for privacy violations before delivery. The scanner checks for patterns like:

- Direct attribution: "Kyle said...", "According to Kyle..."
- Source revelation: "Kyle told me...", "Kyle mentioned..."
- Private domain leaks: sharing health/finance info with attribution

If a violation is detected, the message is flagged for review.

## Agent tools

Two tools help the agent work with privacy:

### `hearth_context_check`

Check the privacy boundary for information before sharing:

```
Input:  { content: "dinner allergies", domain: "health", chatType: "group" }
Output: { privacyLayer: "private", canShareInGroup: false, guidance: "..." }
```

### `hearth_context_note`

Store a scoped context note with privacy tagging:

```
Input:  { content: "Allergic to shellfish", memberId: "...", privacyLayer: "private", domain: "health" }
Output: { stored: true, privacyLayer: "private" }
```

See [Tools](/hearth/tools) for full tool documentation.

## Config reference

```json5
{
  privacy: {
    // Default privacy layer for group context
    // "public" | "subgroup" | "private" | "agent-inferred"
    defaultLayer: "public",

    // Domain-specific overrides
    domainRules: [
      { domain: "finances", layer: "private" },
      { domain: "health", layer: "private" },
    ],
  },
}
```

## Related

- [Guardrails](/hearth/guardrails) — communication principles enforcement
- [Tools](/hearth/tools) — privacy tools (`hearth_context_check`, `hearth_context_note`)
- [Members](/hearth/members) — member model and resolution
