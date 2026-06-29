# Current Development Snapshot

## Project

Zhixing is a local-first personal behavior management PWA built around an infinitely
nested card tree. The authoritative product spec is `SPEC.md`.

## Current Milestone

M0 - Setup complete. Next milestone is M1 - Domain core.

## Current Status

M0 created a minimal Vite + React + TypeScript app shell, testing/lint/build
configuration, PWA scaffold, Playwright smoke test, and the development log system.
Git has been initialized for the project.

## Verification

- `pnpm exec prettier --check package.json .prettierrc.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts eslint.config.js index.html public/manifest.webmanifest src tests docs/dev-log` - passed.
- `pnpm typecheck` - passed.
- `pnpm lint` - passed.
- `pnpm test` - passed: 1 test.
- `pnpm test:coverage` - passed: 100% statements, 100% lines on current measured files.
- `pnpm build` - passed and generated PWA service worker output.
- `pnpm e2e` - passed: 2 tests across Chromium and mobile Safari profile.
- Security scan for `console.log`, `sk-`, `api_key`, and `apiKey` in source/config files returned no matches.
- Git repository initialized and the M0 baseline has been committed.

## Active Decisions

- Keep M0 narrow: app shell and tooling only.
- No tree operations, card UI, IndexedDB, drag/drop, or editing in M0.
- Use `CURRENT.md` plus append-only entries as the handoff system.
- Playwright browser binaries were installed into the local user cache so e2e can run.
- Local git commit identity is `Codex <codex@local>` unless the user chooses a different identity later.

## Next Steps

1. Start M1 with `features/tree/types.ts`, `visuals.ts`, `treeOps.ts`, `schema.ts`,
   `seed.ts`, and focused unit tests.
2. Add deterministic ID/time seams for tests before implementing tree operations.
3. Keep UI changes out of M1 except a temporary debug surface if needed.
