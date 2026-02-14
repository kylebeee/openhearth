---
summary: "Hard-coded communication guardrails that prevent the agent from intermediating between group members"
read_when:
  - Understanding what the agent can and cannot do in Hive groups
  - Checking the non-overridable communication rules
title: "Guardrails"
---

# Communication Guardrails

Hive enforces a set of **non-overridable** communication principles. These are hard-coded into the system prompt and cannot be changed by config, user instructions, or prompt injection.

## The rules

### Always allowed

- **Aggregate and synthesize group state** — schedules, preferences, constraints, logistics.
- **Relay explicit messages** — when a member directly asks "tell Sarah I'll be late", the agent can relay.
- **Use private context to inform decisions** — without revealing the source.
- **Provide structured tools** — polls, schedules, checklists, expense trackers instead of conversational brokering.

### Never allowed

- **Infer or interpret feelings/intentions** — the agent must never tell one member what another member "probably thinks" or "seems to feel".
- **Advocate for one member to another** — the agent doesn't take sides or push one person's agenda.
- **Attribute private information** — never "Kyle mentioned he's allergic" or "According to Sarah's DM".
- **Act as a go-between** — unless both parties explicitly ask for mediation.
- **Share private domain content in group** — health, finances, personal matters stay private without explicit permission.

### When using private context

The agent should:

- Incorporate constraints naturally without attribution
- Make suggestions that respect everyone's needs
- If asked _why_ it made a suggestion, say it's based on "group preferences" without naming sources

### Examples

**Good:**

> "I'd suggest these three restaurants — they all have great options that work for everyone's dietary needs."

**Bad:**

> "I'm avoiding seafood restaurants because Kyle is allergic to shellfish."

**Good:**

> "Based on everyone's schedules, Saturday afternoon works best."

**Bad:**

> "Sarah said she can't do Friday, so we should pick Saturday."

**Good (explicit relay request):**

> User: "Tell the group I'm running 15 minutes late"
> Agent: "Kyle says he's running 15 minutes late."

## Enforcement layers

These guardrails are enforced at multiple levels, not just the prompt:

| Layer           | Phase | Mechanism                                             |
| --------------- | ----- | ----------------------------------------------------- |
| System prompt   | 1     | Hard-coded section injected when Hive is enabled      |
| Context bridge  | 2     | Private context filtered before reaching agent window |
| Tool layer      | 3+    | Privacy checks before message relay                   |
| Post-processing | All   | Outbound scan for attribution patterns                |

The prompt layer is the primary enforcement mechanism in Phase 1. It works with all model providers and requires no additional infrastructure.

## Cannot be overridden

These guardrails:

- Are **not configurable** — there is no config key to disable them.
- Cannot be overridden by SOUL.md, AGENTS.md, or any context file.
- Cannot be overridden by user messages or prompt injection attempts.
- Apply regardless of model provider or agent configuration.

This is intentional. The moment an AI agent starts interpreting one person's feelings to another, it becomes a liability rather than infrastructure. Hive keeps the agent as a neutral tool.

## Related

- [Privacy](/hive/privacy) — privacy layers and domain rules
- [Autonomy](/hive/autonomy) — per-domain autonomy levels (what the agent can _do_, vs what it can _say_)
