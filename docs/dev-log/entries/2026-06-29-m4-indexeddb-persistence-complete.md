# 2026-06-29 - M4 IndexedDB Persistence Complete

## Completed

- Added a `TreeStorage` interface for loading and saving `TreeState`.
- Added an IndexedDB-backed storage adapter using `idb-keyval`.
- Added a memory storage adapter for component tests.
- Added v1 storage serialization and validation before accepting stored data.
- Wired `AppShell` to hydrate from storage before saving changes.
- Added e2e coverage that adds a card, reloads, and verifies it remains.

## Verification

- `pnpm typecheck` - passed.
- `pnpm lint` - passed.
- `pnpm test` - passed: 75 tests across 17 files.
- `pnpm test:coverage` - passed: 90.9% statements, 83.26% branches, 91.33%
  functions, 91.35% lines.
- `pnpm build` - passed.
- `pnpm e2e` - passed: 12 browser checks including persistence after reload on
  Chromium and mobile Safari profile.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Sensitive string scan for `console.log`, `sk-`, `api_key`, and `apiKey` in
  source/config files returned no matches.

## Notes

- Existing project-wide Prettier issues in `SPEC.md`, `playwright.config.ts`, and
  `pnpm-lock.yaml` remain intentionally untouched.
- Import/export should reuse the same v1 tree schema payload.
