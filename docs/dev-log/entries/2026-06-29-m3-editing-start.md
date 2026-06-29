# 2026-06-29 - M3 Editing Core Start

## Goal

Add local editing interactions on top of the M2 read-only card browser.

## Scope

- Enable add-card placeholder as an inline title input.
- Add an edit sheet for title, subtitle, color, mark, and delete.
- Add delete confirmation.
- Add a single-step undo toast for delete.
- Keep edits in local React state until M4 persistence.

## Out of Scope

- Drag reorder and reparent.
- IndexedDB persistence.
- Import/export UI and settings sheet.

## Testing Intent

Tests should exercise user-visible editing behavior: creating a card, renaming and setting a
subtitle, changing color/mark overrides, deleting a card, and undoing the deletion.
