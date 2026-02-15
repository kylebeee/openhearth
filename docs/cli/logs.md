---
summary: "CLI reference for `openhearth logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
title: "logs"
---

# `openhearth logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:

- Logging overview: [Logging](/logging)

## Examples

```bash
openhearth logs
openhearth logs --follow
openhearth logs --json
openhearth logs --limit 500
openhearth logs --local-time
openhearth logs --follow --local-time
```

Use `--local-time` to render timestamps in your local timezone.
