# 2026-06-29 - M4 Reset Complete

## Goal

Finish the local data management slice by giving users a way to recover from bad
local state or intentionally return to the initial starter tree.

## Completed

- Added a confirmed `恢复初始数据` path to the settings sheet.
- Added AppShell reset handling that restores the seed tree, clears edit/undo/import
  state, closes settings, and resets navigation to the root level.
- Kept storage behavior inside the existing post-hydration save flow, so reset
  persists by saving the restored seed tree.
- Added unit coverage for settings reset confirmation and AppShell reset behavior.
- Added e2e coverage that adds a card, resets local data, reloads, and verifies the
  added card stays removed.

## Verification

- `pnpm exec prettier --write <changed files>` - passed.
- `pnpm typecheck` - passed.
- `pnpm lint` - passed.
- `pnpm test` - passed: 86 tests across 19 files.
- `pnpm test:coverage` - passed: 91.38% statements, 82.05% branches, 90.84%
  functions, 91.78% lines.
- `pnpm build` - passed.
- `pnpm e2e` - passed: 16 browser checks including reset on Chromium and mobile
  Safari profile.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Sensitive string scan for `console.log`, `sk-`, `api_key`, and `apiKey` in
  source/config files returned no matches.

## Decisions

- Reset restores the starter seed tree instead of deleting the IndexedDB key, because
  the app already treats the tree state as the single source of truth after hydration.
- Reset requires a second confirmation click.
- Full backup conflict handling and multi-version migration remain deferred.

## Next Steps

1. Commit M4 reset.
2. Review `SPEC.md` and choose the next product slice.
