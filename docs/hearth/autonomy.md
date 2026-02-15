---
summary: "Configurable per-domain autonomy levels for Hearth groups"
read_when:
  - Controlling how autonomous the agent is in different domains
  - Setting up ask-first vs autonomous behavior
title: "Autonomy"
---

# Autonomy

Hearth lets you control how autonomous the agent is across different domains. The agent might schedule a dinner reservation autonomously but ask before spending money.

## Autonomy levels

| Level        | Behavior                                   | Example            |
| ------------ | ------------------------------------------ | ------------------ |
| `passive`    | Observe only; do not act or suggest        | Conflict mediation |
| `suggest`    | Suggest options but wait for approval      | Travel booking     |
| `ask-first`  | Propose an action and ask before executing | Spending money     |
| `autonomous` | Act independently; inform after the fact   | Scheduling         |

## Default domains

These are the recommended defaults for a family/team group:

```json5
{
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
}
```

## How it works

Autonomy levels are injected into the system prompt as guidance for the agent. The agent sees instructions like:

```
## Hearth Autonomy Levels
Your autonomy varies by domain. Follow these levels:
- scheduling: autonomous (act autonomously, inform after the fact)
- spending: ask-first (propose an action and ask before executing)
- conflict: passive (observe only, do not act or suggest)
```

The agent interprets and follows these instructions within its reasoning. This is prompt-based enforcement in Phase 1; future phases will add tool-level gates.

## Domain names

Domain names are free-form strings. Use whatever labels make sense for your group. Common domains:

| Domain           | Description                            |
| ---------------- | -------------------------------------- |
| `scheduling`     | Calendar, reminders, time coordination |
| `info-lookup`    | Research, fact-checking, web search    |
| `task-tracking`  | To-do lists, assignments, checklists   |
| `spending`       | Purchases, reservations with cost      |
| `external-comms` | Sending messages outside the group     |
| `personal`       | Personal matters between members       |
| `conflict`       | Disagreements, mediation               |
| `food`           | Meal planning, restaurant selection    |
| `travel`         | Trip planning, bookings                |
| `errands`        | Household tasks, shopping lists        |

## Per-group autonomy

Different groups can have different autonomy settings:

```json5
{
  hearth: {
    groups: {
      "whatsapp:group:family@g.us": {
        name: "Family",
        autonomy: {
          domains: [
            { domain: "scheduling", level: "autonomous" },
            { domain: "spending", level: "ask-first" },
          ],
        },
      },
      "slack:channel:C0123WORK": {
        name: "Work Team",
        autonomy: {
          domains: [
            { domain: "scheduling", level: "ask-first" },
            { domain: "spending", level: "passive" },
          ],
        },
      },
    },
  },
}
```

## Phase status

Autonomy config is accepted in Phase 1 and included in the system prompt. The full autonomy evaluator (Phase 5) will add runtime decision gating, integration with the coordination engine, and autonomy-level overrides per member role.

## Related

- [Guardrails](/hearth/guardrails) — what the agent can say (separate from what it can do)
- [Privacy](/hearth/privacy) — privacy layers
- [Configuration](/hearth/configuration) — full config reference
