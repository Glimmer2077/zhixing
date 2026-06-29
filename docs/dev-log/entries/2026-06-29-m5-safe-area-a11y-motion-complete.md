# 2026-06-29 - M5 Safe Area A11y Motion Complete

## Goal

Close the M5 acceptance gaps for safe-area handling, dialog accessibility, focus
restoration, and reduced-motion behavior.

## Completed

- Expanded app shell and toast safe-area handling to include left and right insets.
- Expanded fixed edit/settings sheet padding to respect all safe-area insets.
- Added global focus-visible styling for standard interactive controls.
- Added a global `prefers-reduced-motion: reduce` guard for animation and transition
  duration.
- Added a shared dialog close hook that handles Escape and close-button actions while
  restoring focus after the close event completes.
- Connected settings return focus explicitly through the header settings button ref.
- Switched edit and settings dialogs from `aria-label` to heading-backed
  `aria-labelledby`.
- Disabled card tap scaling when reduced motion is requested.
- Added unit coverage for dialog focus restoration and reduced-motion card behavior.
- Added e2e coverage for settings focus restoration and reduced-motion browsing on
  Chromium and the mobile Safari profile.

## Verification

- `./node_modules/.bin/prettier --write <changed files>` - passed.
- `./node_modules/.bin/tsc -b --pretty false` - passed.
- `./node_modules/.bin/eslint . --max-warnings=0` - passed.
- `./node_modules/.bin/vitest run` - passed: 96 tests across 20 files.
- `./node_modules/.bin/vitest run --coverage` - passed: 91.97% statements, 82.73%
  branches, 92.2% functions, 92.33% lines.
- `./node_modules/.bin/vite build` - passed and generated `dist/sw.js`.
- `CI= ./node_modules/.bin/playwright test` - passed: 23 checks, 1 intentional
  mobile Safari skip for the WebKit PWA reload interception limitation.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Sensitive string scan for `console.log`, `sk-`, `api_key`, and `apiKey` in
  source/config files returned no matches.
- `curl -I http://127.0.0.1:5173/` - returned 200 OK.

## Decisions

- Settings focus restoration uses an explicit return-focus ref because browser and
  automation click behavior do not consistently leave the opener as `activeElement`.
- Edit sheet focus restoration keeps the captured opener fallback because edit
  affordances are card-local and do not currently need a dedicated ref handoff.
- Reduced-motion e2e verifies the media preference and usable navigation; the exact
  card tap scaling guard is covered at the component boundary.

## Next Steps

1. Commit M5 safe-area/a11y/motion QA.
2. Decide whether appearance controls are needed before final v1 acceptance.
3. Run final v1 acceptance pass against `SPEC.md`.
