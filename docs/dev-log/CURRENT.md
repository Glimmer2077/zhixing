# Current Development Snapshot

## Project

Zhixing is a local-first personal behavior management PWA built around an infinitely
nested card tree. The authoritative product spec is `SPEC.md`.

## Current Milestone

M1 - Domain core complete. Next milestone is M2 - Read UI.

## Current Status

M0 created a minimal Vite + React + TypeScript app shell, testing/lint/build
configuration, PWA scaffold, Playwright smoke test, and the development log system.
Git has been initialized for the project. M1 added the pure tree/domain layer
with tests before UI work.

## Verification

- `pnpm exec prettier --check package.json .prettierrc.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts eslint.config.js index.html public/manifest.webmanifest src tests docs/dev-log` - passed.
- `pnpm typecheck` - passed.
- `pnpm lint` - passed.
- `pnpm test` - passed: 43 tests across 9 files.
- `pnpm test:coverage` - passed: 95.76% statements, 86.71% branches, 100% functions,
  95.59% lines.
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
- M1 follows TDD: tests first, implementation second.
- M1 stays UI-free except for existing M0 app shell.
- Tree import validation checks schema shape, missing references, duplicate references,
  cycles, orphans, and node key/id mismatches.

## Next Steps

1. Commit M1 as `feat: add tree domain core`.
2. Start M2 with read-only rendering over the seed: `Mark`, `Card`, `CardGrid`,
   masonry layout, `Header`, and navigation shell.
3. Keep editing, persistence store, import/export UI, and drag/drop for later milestones.
