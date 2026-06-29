# Development Log Protocol

This folder is the project memory for Zhixing. Keep it updated whenever a milestone starts,
ends, or changes direction.

## Files

- `CURRENT.md`: the latest handoff snapshot. Read this first after any context loss.
- `entries/`: append-only chronological notes for decisions, changes, verification, and risks.

## Update Rules

1. Update `CURRENT.md` at the start and end of each milestone.
2. Add one entry under `entries/` for each meaningful work session.
3. Each entry should include goal, files changed, commands run, decisions, blockers, and next steps.
4. Never rely on chat history for essential project state; write it here.
5. Keep notes factual and short enough to scan.

## Recovery Checklist

After context loss, read these in order:

1. `SPEC.md`
2. `docs/dev-log/CURRENT.md`
3. The most recent file in `docs/dev-log/entries/`
