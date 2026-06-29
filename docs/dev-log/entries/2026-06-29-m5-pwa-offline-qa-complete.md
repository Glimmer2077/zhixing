# 2026-06-29 - M5 PWA Offline QA Complete

## Goal

Close the M5 acceptance gap around PWA app-shell availability when network requests
fail.

## Completed

- Added Playwright coverage that waits for service worker control, reloads once,
  then blocks network requests and verifies the app shell still renders.
- Scoped the request-failure reload assertion to Chromium because Playwright WebKit
  blocks intercepted reloads before the service worker fallback can be asserted.
- Changed Playwright's webServer command to invoke the local Vite binary directly,
  avoiding pnpm's interactive `node_modules` rebuild prompt in non-TTY runs.
- Ignored `.pnpm-store/` because pnpm can create it as local cache during tooling
  runs.

## Verification

- `./node_modules/.bin/prettier --write tests/e2e/app-shell.spec.ts playwright.config.ts`
  - passed.
- `./node_modules/.bin/tsc -b --pretty false` - passed.
- `./node_modules/.bin/eslint . --max-warnings=0` - passed.
- `./node_modules/.bin/vitest run` - passed: 93 tests across 20 files.
- `./node_modules/.bin/vitest run --coverage` - passed: 91.65% statements, 82.99%
  branches, 91.44% functions, 92% lines.
- `./node_modules/.bin/vite build` - passed and generated `dist/sw.js`.
- `CI= ./node_modules/.bin/playwright test` - passed: 19 checks, 1 intentional
  mobile Safari skip for the WebKit reload interception limitation.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Sensitive string scan for `console.log`, `sk-`, `api_key`, and `apiKey` in
  source/config files returned no matches.
- `curl -I http://127.0.0.1:5173/` - returned 200 OK.

## Decisions

- Keep the PWA offline reload regression Chromium-only until Playwright WebKit can
  assert service worker reload fallback without treating route interception as a
  blocked navigation.
- Use direct local tooling binaries for verification while pnpm is prone to
  interactive prompts in this workspace.

## Next Steps

1. Commit M5 PWA/offline QA.
2. Continue M5 acceptance QA for safe-area, accessibility, and reduced-motion.
3. Decide whether appearance controls are needed before v1 acceptance.
