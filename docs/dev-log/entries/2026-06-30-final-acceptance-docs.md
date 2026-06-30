# 2026-06-30 - Final Acceptance Docs

## Goal

Record the current v1 acceptance state and answer how the PWA gets installed on a
phone without relying on chat history.

## Completed

- Added `docs/ACCEPTANCE.md` with the current implemented scope, verification pass,
  known Playwright mobile Safari skip, and local-only product notes.
- Added `docs/INSTALL_PHONE.md` with build, HTTPS hosting, iPhone install, Android
  install, post-install verification, and backup guidance.
- Updated `docs/dev-log/CURRENT.md` so the next handoff points to the new docs.

## Verification

- Documentation-only change after the last full verification pass.
- Last full pass remains:
  - `./node_modules/.bin/tsc -b --pretty false` - passed.
  - `./node_modules/.bin/eslint . --max-warnings=0` - passed.
  - `./node_modules/.bin/vitest run` - passed: 117 tests across 25 files.
  - `./node_modules/.bin/vitest run --coverage` - passed: 91.08% statements,
    82.45% branches, 91.04% functions, 91.34% lines.
  - `./node_modules/.bin/vite build` - passed.
  - `CI=1 ./node_modules/.bin/playwright test` - passed: 31 checks, 1 intentional
    mobile Safari skip.
  - `pnpm audit --audit-level moderate` - passed.

## Decisions

- Phone install requires a real HTTPS deployment; `127.0.0.1` is only useful for
  local development on the same machine.
- Store packaging is not needed for v1. Static HTTPS hosting is the primary release
  path.
- Local data risk is explicit in the install docs: users should export JSON backups.

## Next Steps

1. Commit these docs.
2. Choose an HTTPS host for the current `dist/` build.
