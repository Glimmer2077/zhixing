# Current Development Snapshot

## Project

Zhixing is a local-first personal behavior management PWA built around an infinitely
nested card tree. The authoritative product spec is `SPEC.md`.

## Current Milestone

M3 - Editing core and same-level drag reorder complete; cross-parent reparent is
the next M3 slice.

## Current Status

M0 created a minimal Vite + React + TypeScript app shell, testing/lint/build
configuration, PWA scaffold, Playwright smoke test, and the development log system.
Git has been initialized for the project. M1 added the pure tree/domain layer
with tests before UI work. M2 added the read-only card browsing UI over the seed.
M3 added the first local editing interactions: inline card creation, edit sheet,
delete confirmation, single-step undo, and same-level drag reorder through
`dnd-kit`. Edits still live in React state only; persistence remains deferred.

## Verification

- `pnpm exec prettier --check <changed files>` - passed.
- Project-wide `pnpm exec prettier --check .` still reports existing formatting issues
  in `SPEC.md`, `playwright.config.ts`, and `pnpm-lock.yaml`; they were left untouched
  to avoid unrelated churn.
- `pnpm typecheck` - passed.
- `pnpm lint` - passed.
- `pnpm test` - passed: 67 tests across 16 files.
- `pnpm test:coverage` - passed: 91.44% statements, 81.36% branches, 91.34%
  functions, 91.81% lines.
- `pnpm build` - passed and generated PWA service worker output.
- `pnpm e2e` - passed: 4 specs across Chromium and mobile Safari profile, 8 total
  browser checks.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Git commits exist through M3 editing core; same-level drag reorder is ready to commit.

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
- M2 keeps editing, persistence, import/export UI, settings sheet, and drag/drop out of scope.
- M2 add/settings affordances are visible placeholders and intentionally disabled until later
  milestones.
- M3 first slice includes add, edit sheet, delete confirmation, and single-step undo.
- M3 same-level drag reorder uses `dnd-kit` handles and the existing tree `reorder`
  operation.
- Cross-parent reparent remains the next M3 slice.

## Next Steps

1. Commit same-level drag reorder.
2. Add cross-parent reparent as the next M3 slice.
3. Then start M4 persistence once editing gestures are stable.
