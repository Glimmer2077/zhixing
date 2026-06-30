# 2026-06-30 - M5 Appearance Controls Complete

## Goal

Close the Settings-sheet `外观` gap from `SPEC.md` before the final v1 acceptance
pass.

## Completed

- Added an appearance preference module with `system`, `light`, and `dark` values.
- Persisted the preference under `zhixing.theme.v1`.
- Applied explicit light/dark overrides through `html[data-theme]`.
- Kept `system` as the default by removing the explicit override and letting
  `prefers-color-scheme` CSS decide.
- Added Settings controls for `跟随系统`, `浅色`, and `深色`.
- Added CSS token overrides for explicit light and dark themes.
- Added unit coverage for preference persistence/application and Settings control
  behavior.
- Added AppShell coverage for applying and persisting the chosen theme.
- Added e2e coverage proving the selected appearance survives reload on Chromium and
  the mobile Safari profile.

## Verification

- `./node_modules/.bin/prettier --write <changed files>` - passed.
- `./node_modules/.bin/tsc -b --pretty false` - passed.
- `./node_modules/.bin/eslint . --max-warnings=0` - passed.
- `./node_modules/.bin/vitest run` - passed: 103 tests across 21 files.
- `./node_modules/.bin/vitest run --coverage` - passed: 92.28% statements, 83.17%
  branches, 92.63% functions, 92.61% lines.
- `./node_modules/.bin/vite build` - passed and generated `dist/sw.js`.
- `CI= ./node_modules/.bin/playwright test` - passed: 25 checks, 1 intentional
  mobile Safari skip for the WebKit PWA reload interception limitation.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Sensitive string scan for `console.log`, `sk-`, `api_key`, and `apiKey` in
  source/config files returned no matches.
- `curl -I http://127.0.0.1:5173/` - returned 200 OK after restarting the local dev
  server.

## Acceptance Gaps Found

- Reparent is currently available through the edit sheet parent selector, not by
  dragging a card onto another card with a drop affordance.
- Undo is currently a single delete undo toast, not full zundo-backed undo/redo for
  every structural change.
- Swipe-down back gesture is not implemented; back button, browser/system back, and
  persisted path are implemented.
- Export/import works with the v1 schema, but export filename/copy still differs
  from the exact `SPEC.md` examples.

## Decisions

- Appearance preference is local UI state, so localStorage is sufficient and avoids
  coupling it to the tree persistence schema.
- The `system` option removes `data-theme`; explicit `light` and `dark` use
  `html[data-theme]` so they override `prefers-color-scheme`.

## Next Steps

1. Commit M5 appearance controls.
2. Pick the next acceptance gap to close.
3. Run another final acceptance pass against `SPEC.md`.
