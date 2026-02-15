---
summary: "CLI reference for `openhearth agents` (list/add/delete/set identity)"
read_when:
  - You want multiple isolated agents (workspaces + routing + auth)
title: "agents"
---

# `openhearth agents`

Manage isolated agents (workspaces + auth + routing).

Related:

- Multi-agent routing: [Multi-Agent Routing](/concepts/multi-agent)
- Agent workspace: [Agent workspace](/concepts/agent-workspace)

## Examples

```bash
openhearth agents list
openhearth agents add work --workspace ~/.openhearth/workspace-work
openhearth agents set-identity --workspace ~/.openhearth/workspace --from-identity
openhearth agents set-identity --agent main --avatar avatars/openhearth.png
openhearth agents delete work
```

## Identity files

Each agent workspace can include an `IDENTITY.md` at the workspace root:

- Example path: `~/.openhearth/workspace/IDENTITY.md`
- `set-identity --from-identity` reads from the workspace root (or an explicit `--identity-file`)

Avatar paths resolve relative to the workspace root.

## Set identity

`set-identity` writes fields into `agents.list[].identity`:

- `name`
- `theme`
- `emoji`
- `avatar` (workspace-relative path, http(s) URL, or data URI)

Load from `IDENTITY.md`:

```bash
openhearth agents set-identity --workspace ~/.openhearth/workspace --from-identity
```

Override fields explicitly:

```bash
openhearth agents set-identity --agent main --name "OpenHearth" --emoji "🦞" --avatar avatars/openhearth.png
```

Config sample:

```json5
{
  agents: {
    list: [
      {
        id: "main",
        identity: {
          name: "OpenHearth",
          theme: "space lobster",
          emoji: "🦞",
          avatar: "avatars/openhearth.png",
        },
      },
    ],
  },
}
```
