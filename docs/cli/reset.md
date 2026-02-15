---
summary: "CLI reference for `openhearth reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `openhearth reset`

Reset local config/state (keeps the CLI installed).

```bash
openhearth reset
openhearth reset --dry-run
openhearth reset --scope config+creds+sessions --yes --non-interactive
```
