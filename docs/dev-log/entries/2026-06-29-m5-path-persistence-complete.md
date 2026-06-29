# 2026-06-29 - M5 Path Persistence Complete

## Goal

Close the acceptance gap where the tree data survived reloads but the current
navigation path returned to root.

## Completed

- Added local path persistence under `zhixing.path.v1`.
- Updated `useNavigation` so push, pop, reset, and browser `popstate` keep the
  persisted path and History state in sync.
- Added repair behavior for malformed persisted paths.
- Added AppShell validation that waits until tree hydration completes, then resets
  stale or structurally invalid paths back to root.
- Added a Vitest localStorage shim because the current jsdom runtime did not expose
  working localStorage methods in unit tests.
- Added unit coverage for `useNavigation`, AppShell path restoration, and stale path
  recovery.
- Added e2e coverage for drilling into a card, reloading, and staying at the same
  card level on Chromium and mobile Safari profile.

## Verification

- `pnpm exec prettier --write <changed files>` - passed.
- `pnpm typecheck` - passed.
- `pnpm lint` - passed.
- `pnpm test` - passed: 91 tests across 20 files.
- `pnpm test:coverage` - passed: 91.72% statements, 83.1% branches, 91.33%
  functions, 92.08% lines.
- `pnpm build` - passed.
- `pnpm e2e` - passed: 18 browser checks including current-card reload persistence
  on Chromium and mobile Safari profile.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Sensitive string scan for `console.log`, `sk-`, `api_key`, and `apiKey` in
  source/config files returned no matches.

## Decisions

- Tree data remains in IndexedDB; navigation path uses localStorage because it is a
  small UI-state value and is independent from the tree payload schema.
- Path validation checks both node existence and parent-child chain structure.
- Invalid paths reset to root instead of trying to salvage partial paths, keeping the
  behavior predictable after import, reset, delete, or future migrations.

## Next Steps

1. Commit M5 path persistence.
2. Add settings polish from `SPEC.md`: import confirmation, backup reminder, and about.
3. Continue final M5 QA for PWA/offline/safe-area/a11y/motion.
