# 2026-06-29 - M3 Same-Level Reorder Complete

## Completed

- Added `reorderSiblingsById` as a small id-based adapter over the existing tree
  `reorder` operation.
- Added `dnd-kit` sortable context to the card grid.
- Added per-card sort handles labelled `排序 <卡片标题>`.
- Wired drag end events to reorder only the current sibling list.
- Kept cross-parent reparent out of this slice.

## Verification

- `pnpm typecheck` - passed.
- `pnpm lint` - passed.
- `pnpm test` - passed: 67 tests across 16 files.
- `pnpm test:coverage` - passed: 91.44% statements, 81.36% branches, 91.34%
  functions, 91.81% lines.
- `pnpm build` - passed.
- `pnpm e2e` - passed: 8 browser checks including drag reorder on Chromium and
  mobile Safari profile.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Sensitive string scan for `console.log`, `sk-`, `api_key`, and `apiKey` in
  source/config files returned no matches.

## Notes

- Sorting currently changes order within the visible parent only.
- Cross-parent reparent remains the next M3 slice.
