# Current Development Snapshot

## Project

Zhixing is a local-first personal behavior management PWA built around an infinitely
nested card tree. The authoritative product spec is `SPEC.md`.

## Current Milestone

M5 - polish and acceptance QA in progress; tracked major acceptance gaps are closed
and verified.

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
M5 safe-area/a11y/motion QA expands safe-area padding to fixed sheets and
horizontal insets, adds dialog focus restoration, labels dialogs from their
headings, and disables tap scaling when reduced motion is requested.
M5 appearance controls add the Settings `外观` section with `跟随系统` / `浅色` /
`深色`, persist the preference in localStorage, and apply explicit light/dark
overrides through `html[data-theme]`.
M5 drag-to-parent reparent adds card-body drop behavior: dragging to a target
card's top/handle area keeps same-level reorder, while dragging into the card body
moves the active card under that target with a visible drop outline.
M5 full undo/redo replaces the delete-only undo state with a zundo temporal tree
history. Structural edits now enter the same history stack, Header exposes undo
and redo affordances, and transient undo toasts stay out of the way while sheets
are open.
M5 swipe-down back adds a downward pointer gesture from non-interactive nested
screen chrome/content to return to the parent level, while preserving button,
form, card, and drag interactions.
M5 export/copy polish aligns Settings copy and export naming with the spec: Settings
uses `导出` / `导入`, import failures show the full recovery hint, and downloads use
`知行-YYYYMMDD.json`.

## Verification

- `./node_modules/.bin/prettier --write <changed files>` - passed.
- `./node_modules/.bin/tsc -b --pretty false` - passed.
- `./node_modules/.bin/eslint . --max-warnings=0` - passed.
- `./node_modules/.bin/vitest run` - passed: 117 tests across 25 files.
- `./node_modules/.bin/vitest run --coverage` - passed: 91.08% statements, 82.45%
  branches, 91.04% functions, 91.34% lines.
- `./node_modules/.bin/vite build` - passed and generated PWA service worker output.
- `CI=1 ./node_modules/.bin/playwright test` - passed: 31 browser checks, with the
  PWA request-failure reload regression still passing on Chromium and intentionally
  skipped on mobile Safari because Playwright WebKit blocks intercepted reloads.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Sensitive string scan for `console.log`, `sk-`, `api_key`, and `apiKey` in
  source/config files returned no matches.
- `curl -I http://127.0.0.1:5173/` - returned 200 OK.
- Git commits exist through M5 export/copy polish.

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
- M3 cross-parent reparent is available through both the edit sheet parent selector
  and drag-to-parent card-body drops. Reparent appends the moved card to the target
  parent's child list and tree operations retain the cycle guard.
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
- Dialog close behavior uses a shared hook so Escape and close buttons restore focus
  to the opener after the close event completes.
- App shell, fixed toasts, and fixed sheets account for top, bottom, left, and right
  safe-area insets.
- Reduced-motion users keep navigation and sheet transitions at zero-duration and
  card tap scaling is disabled.
- Theme preference key is `zhixing.theme.v1`; `system` removes `data-theme` so the
  existing `prefers-color-scheme` CSS remains authoritative.
- Explicit `light` and `dark` write `html[data-theme]` overrides and survive reload.
- Dragging onto a target card's top/handle zone is treated as same-level reorder;
  dragging into the card body is treated as reparent. This keeps existing sort
  handles usable while adding the requested card-body drop affordance.
- Tree history is isolated in a small zundo temporal store per `AppShell` instance;
  IndexedDB hydration replaces state without creating undo history, while user
  edits are tracked.
- Header undo/redo buttons are the full-history affordance. The transient undo toast
  remains available after edits, but is hidden while edit/settings sheets are open
  so it cannot block mobile sheet actions.
- Swipe-down back starts only from non-interactive elements, uses an 88px downward
  threshold with limited horizontal drift, and delegates navigation to the existing
  `pop()` path.
- Export filenames use local-date components, not ISO strings, so the visible
  download format is `知行-YYYYMMDD.json`.
- Settings action copy follows the §10 short labels `导出` and `导入`; JSON remains
  implied by the Settings context and file accept type.

## Acceptance Gaps

- No major v1 acceptance gaps are currently tracked in this log.

## Next Steps

1. Run a final acceptance pass against `SPEC.md`.
2. Prepare concise install-to-phone instructions for the current PWA build.
