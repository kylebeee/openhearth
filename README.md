# OpenHearth — Group-Native AI Assistant

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

**OpenHearth** is a multi-channel AI gateway evolved for groups, teams, and families. It connects to WhatsApp, Telegram, Slack, Discord, Signal, iMessage, and more — with a built-in **Hearth** system for member identity, privacy layers, and configurable autonomy.

## Hearth — Group Coordination

The Hearth subsystem turns OpenHearth from a personal assistant into a group-aware coordinator:

- **Member Identity**: Know who's talking across every channel. Members are identified by name, role, timezone, and preferred channel — unified across WhatsApp, Telegram, Slack, etc.
- **Privacy Layers**: Four tiers — `public`, `subgroup`, `private`, `agent-inferred`. The agent respects boundaries: private DM content is never attributed in groups.
- **Communication Principles**: OpenHearth is infrastructure, not an intermediary. It aggregates and synthesizes without speculating about feelings, advocating between members, or acting as a go-between.
- **Configurable Autonomy**: Per-domain autonomy levels — `passive`, `suggest`, `ask-first`, `autonomous`. Let the agent handle grocery lists autonomously but require approval for scheduling.
- **Agent Tools**: `hearth_members`, `hearth_member_info`, `hearth_context_check`, `hearth_context_note` — the agent queries group state and respects privacy at every step.

## Quick Start

```bash
# Install
npm install -g openhearth

# Start the gateway
openhearth gateway start

# Run the onboarding wizard
openhearth onboard
```

Configure your first group in `~/.openhearth/openhearth.json`:

```json
{
  "hearth": {
    "enabled": true,
    "groups": {
      "family": {
        "members": [
          {
            "name": "Kyle",
            "role": "owner",
            "timezone": "America/New_York",
            "identities": [
              { "channel": "whatsapp", "id": "+1234567890" },
              { "channel": "telegram", "id": "kyle_username" }
            ]
          }
        ]
      }
    }
  }
}
```

## Supported Channels

| Channel        | Status    |
| -------------- | --------- |
| WhatsApp (Web) | Stable    |
| Telegram       | Stable    |
| Slack          | Stable    |
| Discord        | Stable    |
| Signal         | Stable    |
| iMessage       | macOS     |
| Matrix         | Extension |
| Google Chat    | Extension |
| IRC            | Extension |
| Mattermost     | Extension |
| LINE           | Extension |
| Nostr          | Extension |

## Architecture

```
Channels (WhatsApp, Telegram, ...)
        |
    [ Gateway ]
        |
   [ Hearth ] ← member identity, privacy, autonomy
        |
    [ Agent ] ← AI provider (Anthropic, OpenAI, Ollama, ...)
        |
   [ Tools  ] ← exec, browser, cron, message, memory, ...
```

## Configuration

OpenHearth uses a single JSON config file at `~/.openhearth/openhearth.json`. Key sections:

- `channels` — Channel-specific settings (allowFrom, groups, accounts)
- `hearth` — Group coordination (members, privacy, autonomy)
- `agents` — AI provider configuration
- `tools` — Tool policies and approvals
- `session` — Session management and scoping
- `gateway` — Server settings, auth, TLS

See the [full configuration reference](https://docs.openhearth.ai/gateway/configuration-reference).

## Development

```bash
# Clone and install
git clone https://github.com/kylebeee/openhearth.git
cd openhearth
pnpm install

# Run in dev mode
pnpm dev

# Run tests
pnpm test

# Type check
pnpm check
```

## Forked From

OpenHearth is forked from [OpenClaw](https://github.com/openclaw/openclaw) by Peter Steinberger. We build on that foundation with group-native coordination features.

## License

[MIT](LICENSE)
