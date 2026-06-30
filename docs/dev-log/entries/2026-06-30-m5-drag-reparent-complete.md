# 2026-06-30 - M5 Drag Reparent Complete

## Goal

Close the acceptance gap where cross-parent reparenting existed through the edit
sheet but not by dragging a card onto another card.

## Completed

- Added `CardGrid` reparent support through a new `onReparent` callback.
- Kept same-level reorder intact by treating drops on the target card top/handle zone
  as reorder.
- Added card-body drop behavior: dragging into the target card body reparents the
  active card under that target.
- Added a visible outline affordance for the current reparent drop target.
- Added tested drag intent helpers for reorder-vs-reparent classification.
- Added Playwright coverage for dragging `工作` onto `日常`, verifying `工作` leaves
  root and appears inside `日常`.
- Hardened the existing reload-persistence e2e by waiting for IndexedDB to contain
  the added card before reloading.

## Verification

- `./node_modules/.bin/prettier --write <changed files>` - passed.
- `./node_modules/.bin/tsc -b --pretty false` - passed.
- `./node_modules/.bin/eslint . --max-warnings=0` - passed.
- `./node_modules/.bin/vitest run` - passed: 104 tests across 21 files.
- `./node_modules/.bin/vitest run --coverage` - passed: 90.16% statements, 81.42%
  branches, 90.55% functions, 90.49% lines.
- `./node_modules/.bin/vite build` - passed and generated `dist/sw.js`.
- `CI= ./node_modules/.bin/playwright test` - passed: 27 checks, 1 intentional
  mobile Safari skip for the WebKit PWA reload interception limitation.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Sensitive string scan for `console.log`, `sk-`, `api_key`, and `apiKey` in
  source/config files returned no matches.
- `curl -I http://127.0.0.1:5173/` - returned 200 OK.

## Decisions

- Drop intent is split by target zone: top/handle zone means reorder; card body means
  reparent.
- Reparent appends the moved card to the target parent's children through existing
  `moveNode`, preserving the domain-level cycle guard.
- Drag behavior is covered by Playwright because jsdom cannot reliably exercise
  dnd-kit pointer sensors; pure helper tests cover the classification logic.

## Remaining Acceptance Gaps

- Undo is currently a single delete undo toast, not full zundo-backed undo/redo for
  every structural change.
- Swipe-down back gesture is not implemented.
- Export/import works with the v1 schema, but export filename/copy still differs
  from the exact `SPEC.md` examples.

## Next Steps

1. Commit M5 drag-to-parent reparent.
2. Pick the next remaining acceptance gap to close.
3. Run another final acceptance pass against `SPEC.md`.
