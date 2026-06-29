# Current Development Snapshot

## Project

Zhixing is a local-first personal behavior management PWA built around an infinitely
nested card tree. The authoritative product spec is `SPEC.md`.

## Current Milestone

M5 - polish and acceptance QA in progress; PWA/offline app-shell coverage is ready
to commit.

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
M5 settings polish adds import confirmation before replacing the tree, an iOS backup
reminder beside export/import, and a concise about section.
M5 PWA/offline QA adds a stable Playwright regression that verifies the generated
service worker can keep the app shell visible when network requests fail. The
WebKit reload interception limitation is documented in the test and skipped for
that browser profile.

## Verification

- `./node_modules/.bin/prettier --write tests/e2e/app-shell.spec.ts playwright.config.ts`
  - passed.
- `./node_modules/.bin/tsc -b --pretty false` - passed.
- `./node_modules/.bin/eslint . --max-warnings=0` - passed.
- `./node_modules/.bin/vitest run` - passed: 93 tests across 20 files.
- `./node_modules/.bin/vitest run --coverage` - passed: 91.65% statements, 82.99% branches, 91.44%
  functions, 92% lines.
- `./node_modules/.bin/vite build` - passed and generated PWA service worker output.
- `CI= ./node_modules/.bin/playwright test` - passed: 19 browser checks, with the
  PWA request-failure reload regression passing on Chromium and intentionally
  skipped on mobile Safari because Playwright WebKit blocks intercepted reloads.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Sensitive string scan for `console.log`, `sk-`, `api_key`, and `apiKey` in
  source/config files returned no matches.
- `curl -I http://127.0.0.1:5173/` - returned 200 OK.
- Git commits exist through M5 settings polish; M5 PWA/offline QA is implemented
  and verified for the next commit.

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
- JSON import now requires a second confirmation click before replacing the tree.
- Settings shows the iOS backup reminder from `SPEC.md` and a concise about section.
- Playwright webServer invokes the local Vite binary directly instead of `pnpm preview`
  so e2e runs do not trigger an interactive pnpm `node_modules` rebuild prompt.
- `.pnpm-store/` is ignored because pnpm can create it as local cache during tooling
  runs.

## Next Steps

1. Commit M5 PWA/offline QA.
2. Continue M5 acceptance QA for safe-area/a11y/motion.
3. Decide whether to add appearance controls before final v1 QA.
