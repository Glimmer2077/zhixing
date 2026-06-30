# 知行 v1 Acceptance Summary

Date: 2026-06-30

## Status

The major v1 acceptance gaps tracked in `docs/dev-log/CURRENT.md` are closed.

## Implemented Scope

- Nested card tree with add, edit, delete, move, reorder, and drag-to-parent reparent.
- Card-grid navigation with header back, system/browser back, persisted path, and swipe-down back.
- Local-first IndexedDB persistence with first-run seed fallback.
- JSON export/import using the v1 schema.
- Reset to seed data with confirmation.
- Compact card UI with no visible card edit/sort chrome, no visible header
  undo/redo controls, and no transient undo toast.
- Internal tree history is still retained for future reuse, but v1 public recovery
  relies on confirmation before destructive actions rather than visible undo/redo.
- PWA manifest, service worker generation, offline app-shell regression, iOS-safe viewport metadata.
- Settings import confirmation, backup reminder, theme controls, and about section.
- Light/dark theme override with persisted preference.
- Reduced-motion handling, safe-area padding, dialog labels, and focus restoration.

## Verification

Last full pass:

- `./node_modules/.bin/tsc -b --pretty false` - passed.
- `./node_modules/.bin/eslint . --max-warnings=0` - passed.
- `./node_modules/.bin/vitest run` - passed: 118 tests across 25 files.
- `./node_modules/.bin/vitest run --coverage` - passed: 91.44% statements, 82.05% branches, 91.83% functions, 91.63% lines.
- `./node_modules/.bin/vite build` - passed and generated `dist/sw.js`.
- `CI=1 ./node_modules/.bin/playwright test` - passed: 31 checks, 1 intentional mobile Safari skip.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Sensitive string scan for `console.log`, `sk-`, `api_key`, and `apiKey` in source/config files returned no matches.
- `curl -I http://127.0.0.1:5173/` - returned 200 OK.

## Known Test Limitation

The only skipped Playwright check is the mobile Safari profile for request-failure reload interception. Chromium verifies the service worker app-shell fallback under failed network requests; WebKit blocks that particular intercepted reload path in Playwright. This is tracked in the e2e test itself and does not skip normal mobile Safari flows.

## Remaining Product Notes

- Data is intentionally local-only. There is no account, backend, cloud sync, or analytics.
- iOS may evict PWA storage. Users should export JSON backups from Settings.
- Store or app-store packaging is not required for v1; the current delivery model is an installable HTTPS-hosted PWA.
- Visible undo/redo controls were removed by product decision during the compact UI pass; delete still requires confirmation.
