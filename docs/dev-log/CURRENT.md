# Current Development Snapshot

## Project

Zhixing is a local-first personal behavior management PWA built around an infinitely
nested card tree. The authoritative product spec is `SPEC.md`.

## Current Milestone

M5 - polish and acceptance QA in progress; path persistence is ready to commit.

## Current Status

M0 created a minimal Vite + React + TypeScript app shell, testing/lint/build
configuration, PWA scaffold, Playwright smoke test, and the development log system.
Git has been initialized for the project. M1 added the pure tree/domain layer
with tests before UI work. M2 added the read-only card browsing UI over the seed.
M3 added local editing interactions: inline card creation, edit sheet, delete
confirmation, single-step undo, same-level drag reorder through `dnd-kit`, and
cross-parent reparent through the edit sheet. M4 added IndexedDB-backed local-first
persistence for the tree, with first-run seed fallback and validation before
loading stored state. M4 now also includes settings-sheet JSON export/import that
reuses the v1 tree schema, resets navigation after successful import, and keeps the
current tree unchanged when import validation fails.
M4 now also includes a confirmed reset path in settings that restores the initial
seed tree, clears edit/undo/import state, resets navigation to root, and persists
the restored tree through the existing local-first save path.
M5 started by closing the acceptance gap where data survived reloads but navigation
path did not. The current path now persists locally, reloads restore the current
card level, and stale paths are reset to root after tree hydration.

## Verification

- `pnpm exec prettier --write <changed files>` - passed.
- Project-wide `pnpm exec prettier --check .` still reports existing formatting issues
  in `SPEC.md`, `playwright.config.ts`, and `pnpm-lock.yaml`; they were left untouched
  to avoid unrelated churn.
- `pnpm typecheck` - passed.
- `pnpm lint` - passed.
- `pnpm test` - passed: 91 tests across 20 files.
- `pnpm test:coverage` - passed: 91.72% statements, 83.1% branches, 91.33%
  functions, 92.08% lines.
- `pnpm build` - passed and generated PWA service worker output.
- `pnpm e2e` - passed: 9 specs across Chromium and mobile Safari profile, 18 total
  browser checks.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Sensitive string scan for `console.log`, `sk-`, `api_key`, and `apiKey` in
  source/config files returned no matches.
- Git commits exist through M4 reset; M5 path persistence is implemented and
  verified for the next commit.

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
- M3 cross-parent reparent uses the edit sheet parent selector. It appends the moved
  card to the target parent's child list and excludes the current node plus descendants
  from valid targets.
- Full drag-to-parent interactions are deferred until the UI has a multi-level move
  surface.
- M4 persistence uses a small `TreeStorage` interface with an IndexedDB implementation
  powered by `idb-keyval`.
- AppShell does not save until storage hydration completes, so first-run seed state
  does not overwrite an existing stored tree.
- Invalid stored payloads are ignored via the existing tree schema/invariant validator.
- JSON export writes the same v1 storage payload used by persistence.
- JSON import accepts only validated v1 tree payloads; malformed or invalid files
  show an error and do not mutate the current tree.
- Successful import clears undo/edit state and resets navigation to the root level.
- Reset data uses the settings sheet with a second confirmation step, restores the
  seed tree, and relies on the existing post-hydration save effect to persist it.
- Navigation path is persisted separately from tree data using local storage key
  `zhixing.path.v1`.
- Path restoration waits for tree hydration before deciding whether a stored path is
  stale; stale or structurally invalid paths reset to root.

## Next Steps

1. Commit M5 path persistence.
2. Add settings polish from `SPEC.md`: import confirmation, backup reminder, and about.
3. Continue M5 acceptance QA for PWA/offline/safe-area/a11y/motion.
