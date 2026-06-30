# 2026-06-30 - M5 Swipe Back Complete

## Goal

Close the acceptance gap where nested card screens supported header/browser back
but not the requested swipe-down back gesture.

## Completed

- Added `swipeBack` gesture helpers for downward distance, horizontal drift, and
  interactive-target filtering.
- Wired `AppShell` pointer down/up handling so nested screens can return to the
  parent level with a downward swipe.
- Kept buttons, form controls, dialogs, card buttons, and drag handles out of the
  gesture start zone.
- Added component coverage for swipe-down returning from `工作` to root.
- Added Playwright coverage for the same gesture in Chromium and mobile Safari
  projects.

## Verification

- `./node_modules/.bin/prettier --write <changed files>` - passed.
- `./node_modules/.bin/tsc -b --pretty false` - passed.
- `./node_modules/.bin/eslint . --max-warnings=0` - passed.
- `./node_modules/.bin/vitest run` - passed: 116 tests across 24 files.
- `./node_modules/.bin/vitest run --coverage` - passed: 91.02% statements, 82.41%
  branches, 91.00% functions, 91.28% lines.
- `./node_modules/.bin/vite build` - passed and generated `dist/sw.js`.
- `CI=1 ./node_modules/.bin/playwright test` - passed: 31 checks, 1 intentional
  mobile Safari skip for the WebKit PWA reload interception limitation.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Sensitive string scan for `console.log`, `sk-`, `api_key`, and `apiKey` in
  source/config files returned no matches.
- `curl -I http://127.0.0.1:5173/` - returned 200 OK.

## Decisions

- Use pointer events rather than touch-only events so the gesture is testable and
  works across the desktop and mobile browser projects.
- Require a clear downward gesture: at least 88px vertical movement and no more than
  80px horizontal drift.
- Ignore interactive elements so card taps, edit buttons, add inputs, settings, and
  drag handles retain their existing behavior.

## Remaining Acceptance Gaps

- Export/import works with the v1 schema, but export filename/copy still differs
  from the exact `SPEC.md` examples.

## Next Steps

1. Polish export filename/copy.
2. Run another final acceptance pass.
