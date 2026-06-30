# 2026-06-30 - M5 Export Copy Polish Complete

## Goal

Close the remaining acceptance gap where export/import worked functionally but the
download filename and Settings copy did not match the spec examples.

## Completed

- Added `exportFileName` with the `知行-YYYYMMDD.json` format from `SPEC.md`.
- Wired export downloads through the helper instead of the previous
  `zhixing-YYYY-MM-DD.json` format.
- Updated Settings action labels to the §10 copy: `导出` and `导入`.
- Updated import failure copy to `文件无法读取，请检查是否为知行导出的 JSON`.
- Updated unit and e2e coverage for the new copy and filename format.

## Verification

- `./node_modules/.bin/prettier --write <changed files>` - passed.
- `./node_modules/.bin/tsc -b --pretty false` - passed.
- `./node_modules/.bin/eslint . --max-warnings=0` - passed.
- `./node_modules/.bin/vitest run` - passed: 117 tests across 25 files.
- `./node_modules/.bin/vitest run --coverage` - passed: 91.08% statements, 82.45%
  branches, 91.04% functions, 91.34% lines.
- `./node_modules/.bin/vite build` - passed and generated `dist/sw.js`.
- `CI=1 ./node_modules/.bin/playwright test` - passed: 31 checks, 1 intentional
  mobile Safari skip for the WebKit PWA reload interception limitation.
- `pnpm audit --audit-level moderate` - passed: no known vulnerabilities.
- Sensitive string scan for `console.log`, `sk-`, `api_key`, and `apiKey` in
  source/config files returned no matches.
- `curl -I http://127.0.0.1:5173/` - returned 200 OK.

## Decisions

- Use local date parts for filenames because the spec examples are date-oriented
  and avoid timezone-visible ISO punctuation.
- Keep the `exportJson` / `importJson` string keys for now to minimize churn, but
  update their values to the spec copy.

## Remaining Acceptance Gaps

- No major v1 acceptance gaps are currently tracked in this log.

## Next Steps

1. Run final acceptance pass against `SPEC.md`.
2. Prepare install-to-phone instructions.
