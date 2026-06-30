# 2026-06-30 - Compact Card UI

## Goal

Reduce first-screen visual noise by removing duplicate card/header controls while
preserving the same core editing and drag behaviors through gestures.

## Completed

- Removed visible card drag handles, card edit menu buttons, and card date text.
- Centered card title/subtitle content and centered the mark icon below the text.
- Kept long-press and context-menu editing for cards after removing the edit button.
- Moved drag activation to the card item surface, with pointer movement canceling
  long-press edit so drag does not accidentally open the sheet.
- Kept same-level reorder by dragging onto the target card top zone.
- Kept drag-to-parent reparent by dragging into the target card body.
- Removed Header undo/redo buttons and the bottom undo toast.
- Updated delete confirmation copy so it no longer promises an undo action.

## Verification

- Compact UI tests were written against the requested behavior first and failed
  against the old visible controls.
- Selected test pass after implementation:
  `./node_modules/.bin/vitest run src/features/cards/Card.test.tsx src/features/cards/CardGrid.test.tsx src/features/cards/dragDrop.test.ts src/features/navigation/Header.test.tsx src/app/AppShell.editing.test.tsx src/features/editing/EditSheet.test.tsx`
- `./node_modules/.bin/tsc -b --pretty false` - passed.
- `./node_modules/.bin/eslint . --max-warnings=0` - passed.
- `./node_modules/.bin/vitest run` - passed: 118 tests across 25 files.
- `./node_modules/.bin/vitest run --coverage` - passed: 91.44% statements, 82.05%
  branches, 91.83% functions, 91.63% lines.
- `./node_modules/.bin/vite build` - passed.
- `env BASE_PATH=/zhixing/ ./node_modules/.bin/vite build` - passed.
- `CI=1 ./node_modules/.bin/playwright test` - passed: 31 checks, 1 intentional
  mobile Safari service-worker reload skip.
- Playwright mobile viewport label inspection returned only `设置`, the four card
  titles, and `添加领域`, confirming the removed controls are no longer visible on
  the first screen.

## Decisions

- Keep the internal zundo tree history store for future reuse, but hide public
  undo/redo controls in the current compact interface.
- Treat card top-zone drops as reorder and card body drops as reparent now that
  visible drag handles are gone.
- Keep card editing discoverable through long-press on touch devices and
  context-menu on desktop.

## Next Steps

1. Commit and push the compact UI update.
2. Wait for GitHub Pages deployment.
3. Verify the deployed PWA on a phone, including long-press edit and drag behavior.
