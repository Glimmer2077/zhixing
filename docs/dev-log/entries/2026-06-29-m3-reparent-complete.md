# 2026-06-29 - M3 Cross-Parent Reparent Complete

## Completed

- Added a `移动到` parent selector to the edit sheet.
- Generated valid parent targets from the current tree.
- Excluded the moving node and its descendants from valid targets.
- Moved cards by saving the edit sheet, appending to the target parent's child list.
- Reused the existing `moveNode` operation for tree safety.

## Verification

- `pnpm typecheck` - passed.
- `pnpm lint` - passed.
- `pnpm test` - passed: 70 tests across 16 files.
- `pnpm test:coverage` - passed: 91.82% statements, 83.47% branches, 91.96%
  functions, 92.17% lines.
- `pnpm build` - passed.
- `pnpm e2e` - passed: 10 browser checks including moving a child card to root on
  Chromium and mobile Safari profile.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Sensitive string scan for `console.log`, `sk-`, `api_key`, and `apiKey` in
  source/config files returned no matches.

## Notes

- This slice intentionally uses a parent selector instead of cross-page drag.
- Persistence is still deferred; all editing remains in React state.
- M4 should start with local-first IndexedDB persistence.
