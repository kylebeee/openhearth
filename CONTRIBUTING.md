# Contributing to OpenHearth

Thanks for your interest in contributing!

## Quick Links

- **GitHub:** https://github.com/kylebeee/openhearth
- **Upstream:** https://github.com/openclaw/openclaw

## Maintainers

- **Kyle Breeding** - Project lead
  - GitHub: [@kylebeee](https://github.com/kylebeee)

## Getting Started

```bash
git clone https://github.com/kylebeee/openhearth.git
cd openhearth
pnpm install
pnpm dev
```

## Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run checks: `pnpm check && pnpm test`
5. Commit with a descriptive message
6. Open a pull request

## Code Style

- TypeScript strict mode
- Formatting: `pnpm format`
- Linting: `pnpm lint`
- Type checking: `npx tsc --noEmit`

## Project Structure

- `src/` — Core source code
- `src/hearth/` — Hearth group coordination subsystem
- `extensions/` — Channel extensions (Matrix, Google Chat, IRC, etc.)
- `docs/` — Documentation
- `test/` — Test utilities and mocks
- `ui/` — Control panel web UI

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
