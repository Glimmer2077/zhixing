# 2026-06-30 - M5 Undo Redo Complete

## Goal

Close the acceptance gap where undo was limited to a single delete-only toast
instead of full undo/redo history for structural card changes.

## Completed

- Added a small `treeHistory` wrapper around zundo temporal history for the tree
  state.
- Routed add, edit, delete, move, reorder, reparent, import, and reset through the
  same tracked tree-change path.
- Added Header undo/redo affordances with accessible labels.
- Kept storage hydration out of undo history so loading IndexedDB state does not
  create a bogus undo step.
- Kept transient undo toasts after edits, and hid them while edit/settings sheets
  are open so mobile sheet actions are not blocked.
- Added unit coverage for the zundo history wrapper, Header history buttons,
  consecutive undo/redo behavior, and sheet/toast interaction.
- Added Playwright coverage for undoing and redoing a structural edit from the
  Header.

## Verification

- `./node_modules/.bin/prettier --write <changed files>` - passed.
- `./node_modules/.bin/tsc -b --pretty false` - passed.
- `./node_modules/.bin/eslint . --max-warnings=0` - passed.
- `./node_modules/.bin/vitest run` - passed: 112 tests across 23 files.
- `./node_modules/.bin/vitest run --coverage` - passed: 90.85% statements, 81.88%
  branches, 91.28% functions, 91.12% lines.
- `./node_modules/.bin/vite build` - passed and generated `dist/sw.js`.
- `CI=1 ./node_modules/.bin/playwright test` - passed: 29 checks, 1 intentional
  mobile Safari skip for the WebKit PWA reload interception limitation.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Sensitive string scan for `console.log`, `sk-`, `api_key`, and `apiKey` in
  source/config files returned no matches.
- `curl -I http://127.0.0.1:5173/` - returned 200 OK.

## Decisions

- Keep persistence injection in `AppShell`; zundo owns only in-memory tree history.
- Track user-initiated structural tree changes, but replace hydrated state without
  adding history.
- Use Header undo/redo as the full-history affordance rather than relying on shake
  gestures for v1.
- Hide the transient toast while sheets are open because it can otherwise overlap
  mobile bottom-sheet buttons.

## Remaining Acceptance Gaps

- Swipe-down back gesture is not implemented.
- Export/import works with the v1 schema, but export filename/copy still differs
  from the exact `SPEC.md` examples.

## Next Steps

1. Close swipe-down back.
2. Polish export filename/copy.
3. Run another final acceptance pass.
