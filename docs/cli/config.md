---
summary: "CLI reference for `openhearth config` (get/set/unset config values)"
read_when:
  - You want to read or edit config non-interactively
title: "config"
---

# `openhearth config`

Config helpers: get/set/unset values by path. Run without a subcommand to open
the configure wizard (same as `openhearth configure`).

## Examples

```bash
openhearth config get browser.executablePath
openhearth config set browser.executablePath "/usr/bin/google-chrome"
openhearth config set agents.defaults.heartbeat.every "2h"
openhearth config set agents.list[0].tools.exec.node "node-id-or-name"
openhearth config unset tools.web.search.apiKey
```

## Paths

Paths use dot or bracket notation:

```bash
openhearth config get agents.defaults.workspace
openhearth config get agents.list[0].id
```

Use the agent list index to target a specific agent:

```bash
openhearth config get agents.list
openhearth config set agents.list[1].tools.exec.node "node-id-or-name"
```

## Values

Values are parsed as JSON5 when possible; otherwise they are treated as strings.
Use `--json` to require JSON5 parsing.

```bash
openhearth config set agents.defaults.heartbeat.every "0m"
openhearth config set gateway.port 19001 --json
openhearth config set channels.whatsapp.groups '["*"]' --json
```

Restart the gateway after edits.
