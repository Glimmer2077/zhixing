# 知行 (Zhixing) — Development Spec

> 本文档面向开发者（Codex）编写，以英文为主以减少歧义；所有 UI 文案保留中文。
> A spec for an AI/engineer to implement. English for precision; Chinese kept for UI copy.

## 0. TL;DR（中文）

知行是一个**个人行为管理 PWA**（装到 iOS 主屏）。它**不是 todo 清单**，而是一棵可无限嵌套、可自由增删改的「卡片金字塔」：顶层是领域（工作 / 日常 / 聊天 / 成长…），点进任意一张卡 = 进入它的子卡片网格，逐层变具体。视觉是**奶油色系（高级灰）扁平卡片 + 双列错位 masonry**，每张卡带一枚大号抽象几何标记、粗体标题 + 浅色副标题、左下角创建日期。本地优先、离线、纯私密、无后端、无账号。

v1 **不做**：智能推荐 / 「此刻」/ 截止日期 / 提醒 / 权重 / 搜索 / 同步 / 账号。只做"会呼吸的、好看的、可编辑的卡片结构"。

---

## 1. Scope

### In (v1)
- Infinitely nestable, fully editable card hierarchy (add / rename / delete / move / reorder).
- Card-grid navigation: tap a card to zoom into its children; back to zoom out.
- Visual system: cream/greige flat cards, large generative geometric mark, 2-col staggered masonry.
- Local-first persistence (IndexedDB), JSON export/import, first-run seed.
- Installable PWA, offline, iOS standalone, dark mode.
- Animations (shared-element zoom, stagger), `prefers-reduced-motion` support.
- Accessibility (labels, focus, 44px touch targets).
- Unit + component + e2e tests, ≥80% coverage.

### Out (v1) — intentionally excluded
- 「此刻」/ salience / "what to do now" suggestion. (User decision: just the cards.)
- Weights, cadence, reminders/notifications, due dates.
- Long note / rich-text detail field (detail emerges from nesting).
- Search, filtering, tags, accounts, cloud sync, analytics, any network calls.

The data model is kept **forward-compatible** so 「此刻」can be reintroduced later by adding fields (`weight?`, `lastTouchedAt?`) without restructuring.

---

## 2. Core concept & data model

Everything is a **Node**. The whole app is a normalized tree (forest). All operations are **immutable** (return new state; never mutate).

```ts
// features/tree/types.ts
import type { PALETTE, MARK_KINDS } from './visuals' // see §5

export type ColorKey = (typeof PALETTE)[number]['key']
export type MarkKind = (typeof MARK_KINDS)[number]

export interface Node {
  id: string
  title: string
  subtitle?: string        // lighter second line on the card (optional)
  colorKey?: ColorKey      // optional override; if absent → derived from id
  markKind?: MarkKind      // optional override; if absent → derived from id
  childIds: string[]       // ordered
  createdAt: number        // epoch ms; rendered bottom-left as a date
}

export interface TreeState {
  nodes: Record<string, Node>
  rootIds: string[]        // top-level domains, ordered
}
```

Notes:
- `colorKey` / `markKind` are **derived from `id`** by default (stable, no storage needed) and only persisted when the user explicitly changes them (see §5.4).
- Card **height tier** (S/M/L) is always derived from `id` (never user-set) so the staggered layout is stable across sessions.
- No `parentId` stored — parent is found via the tree; keep a memoized `parentOf` index in the store for O(1) lookups if needed.

### Pure tree operations (testable, no React)

```ts
// features/tree/treeOps.ts — every function returns a NEW TreeState
addNode(s: TreeState, parentId: string | null, init?: Partial<Node>): { state: TreeState; id: string }
updateNode(s: TreeState, id: string, patch: Partial<Pick<Node,'title'|'subtitle'|'colorKey'|'markKind'>>): TreeState
removeNode(s: TreeState, id: string): TreeState        // removes node + ALL descendants, detaches from parent
moveNode(s: TreeState, id: string, newParentId: string | null, index: number): TreeState
reorder(s: TreeState, parentId: string | null, fromIndex: number, toIndex: number): TreeState

// selectors
childrenOf(s: TreeState, parentId: string | null): Node[]
pathTo(s: TreeState, id: string): Node[]               // root → ... → node
isDescendant(s: TreeState, maybeAncestor: string, id: string): boolean
```

Rules:
- `moveNode` **must reject** moving a node into itself or any of its descendants (cycle guard) — return state unchanged or throw a typed error caught by the store.
- `removeNode` must garbage-collect the whole subtree from `nodes`.
- Use structural sharing (spread only the touched branches). `immer` is acceptable since it yields new immutable state.

---

## 3. Navigation & screens

State: `path: string[]` (node ids). Root level = `[]`. The visible grid = `childrenOf(state, path.at(-1) ?? null)`.

- `push(id)` on card tap → append id, animate zoom-in.
- `pop()` on back button / swipe-down / browser back → remove last, animate zoom-out.
- Map `path` to History API (`pushState`) so the iOS back-swipe / Android back works and deep state survives reloads (also persist `path`).

Screens / regions:
1. **Header** (top): when `path` empty → wordmark `知行`; when nested → back chevron `‹` + current node title. Right side → a single icon button (`…`) opening **Settings sheet** (export / import / theme). No bottom tab bar. No big editorial headline.
2. **Card grid** (main): 2-col staggered masonry of `childrenOf(current)` + a trailing **Add card**.
3. **Empty grid**: when current node has no children → centered invitation: `还没有卡片` + large add button (copy per §10).
4. **Edit sheet**: opened by long-press on a card (see §4) — rename, subtitle, color, mark, delete.
5. **Settings sheet**: 导出 JSON / 导入 JSON / 外观（浅色·深色·跟随系统）/ 关于.

---

## 4. Interactions & gestures (iOS-native feel)

- **Drill in**: tap card → shared-element zoom (Motion `layoutId` on the card → next screen background/header). Children fade/slide in with a 40ms stagger.
- **Back**: back chevron, swipe-down, or system back → zoom out (reverse).
- **Add**: trailing dashed "＋ 添加" card at the end of every grid → inline create (focus a text field → type title → commit). New node gets derived color/mark/size; lands at end of current children.
- **Edit**: long-press (≈400ms) a card → open Edit sheet. Fields: 标题, 副标题(可选), 颜色(色板选择), 标记(形状选择), 删除(二次确认). Changing color/mark sets the override field on the node.
- **Reorder**: drag a card to reorder within the current grid (updates `childIds` order). (Milestone M3.)
- **Reparent**: drag a card onto another card → becomes its child (with clear drop affordance + cycle guard). (Milestone M3.)
- **Undo / redo**: after any destructive/structural change show a transient `撤销` toast; full history via `zundo` (`temporal`), bound to a shake gesture and/or a header affordance.
- Use **@dnd-kit** (`@dnd-kit/core` + `@dnd-kit/sortable`) for touch-friendly drag. One `DndContext`; reorder = sortable within the flattened order; reparent = droppable cards.
- All tap targets ≥ 44×44px.

---

## 5. Visual design system

### 5.1 Layout — 2-col staggered masonry（错位）

- Two columns, `gap: 12px`, outer screen padding `16px` + safe-area insets.
- Card **height tier** from id → `S | M | L`. Distribute nodes into the two columns with a **greedy shortest-column** algorithm so columns naturally offset (the 错位 look):

```ts
// features/cards/masonry.ts
const TIER_H = { S: 152, M: 180, L: 212 } as const
export const distribute = (nodes: Node[]): [Node[], Node[]] => {
  const cols: [Node[], Node[]] = [[], []]
  const h = [0, 0]
  for (const n of nodes) {
    const i = h[0] <= h[1] ? 0 : 1
    cols[i].push(n)
    h[i] += TIER_H[sizeFor(n.id)] + 12
  }
  return cols
}
```

- The "Add" card is always appended to the shorter column after distribution.
- On reorder/reparent the distribution is recomputed from the new `childIds` order (source of truth = order; columns are derived).

### 5.2 Card anatomy

```
┌──────────────────────────┐
│ 标题 (bold, title color)   │   ← title  18 / 500
│ 副标题 (lighter)           │   ← subtitle 13 / 400 (optional)
│                          │
│         ◯ / ↘ / ⌒        │   ← MARK: large, centered, mark color
│                          │
│ 2026.6.29                │   ← createdAt, bottom-left, 12 / 400 (sub color)
└──────────────────────────┘
```

- Card: `border-radius: 20px`, no border, no shadow, `padding: 15px`, flat `fill`.
- Mark size by tier: `S 64 / M 78 / L 92` px, centered in the flexible middle area.
- `active`/press: `transform: scale(0.98)`.
- Date format: `Intl.DateTimeFormat`-style `YYYY.M.D` → e.g. `2026.6.29` (no leading zeros). Provide `formatDate(ms): string`.

### 5.3 Palette — 高级灰 / 奶油色系

Muted, grayed, creamy tones. Each entry: `fill` (card bg), `title`, `sub` (subtitle + date), `mark`. Text colors are dark same-family stops → readable on the light fill in BOTH light and dark mode (cards keep their cream fills on a dark canvas; only the chrome flips).

```ts
// features/tree/visuals.ts
export const PALETTE = [
  { key: 'sand',  fill: '#ECE5D4', title: '#5F5440', sub: '#8A7C62', mark: '#CFC2A2' },
  { key: 'sage',  fill: '#D4D9C8', title: '#4C5742', sub: '#6E795F', mark: '#ABB79B' },
  { key: 'mist',  fill: '#CCD4D9', title: '#44535C', sub: '#65737C', mark: '#A6B3BB' },
  { key: 'clay',  fill: '#E3CEBE', title: '#6B4E3B', sub: '#91705A', mark: '#C6A78D' },
  { key: 'lilac', fill: '#D6CEDA', title: '#534862', sub: '#786C86', mark: '#B4A7BD' },
  { key: 'straw', fill: '#E4DAAE', title: '#5E5520', sub: '#837843', mark: '#C9BD84' },
  { key: 'rose',  fill: '#E0CCCB', title: '#674746', sub: '#8C6A69', mark: '#C2A2A1' },
  { key: 'stone', fill: '#DBD4C9', title: '#585042', sub: '#7C7363', mark: '#BDB3A1' },
] as const
```

### 5.4 Generative marks

A small shape vocabulary; each rendered with `currentColor` set to the card's `mark` color.

```ts
export const MARK_KINDS = ['arrow', 'ring', 'arches', 'split', 'pill', 'dots'] as const
```

SVG (viewBox `0 0 80 80` unless noted; `<Mark>` sets width/height by tier and `color` = mark color):

- `arrow`  → `<path d="M24 24 L54 54 M54 32 L54 54 L32 54" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
- `ring`   → `<circle cx="40" cy="40" r="27" fill="none" stroke="currentColor" stroke-width="13"/>`
- `arches` → viewBox `0 0 92 70`: two arcs `M11 60 A34 34 0 0 1 81 60` and `M27 60 A18 18 0 0 1 65 60`, `stroke-width="9" stroke-linecap="round"`.
- `split`  → `<g transform="rotate(20 40 40)"><path d="M41 12 A28 28 0 0 1 41 68 Z" fill="currentColor"/><path d="M37 12 A28 28 0 0 0 37 68 Z" fill="currentColor" opacity=".5"/></g>`
- `pill`   → viewBox `0 0 90 60`: `<rect x="8" y="13" width="74" height="34" rx="17" fill="none" stroke="currentColor" stroke-width="9"/>`
- `dots`   → 3×3 grid of `<circle r="6" fill="currentColor">` at a 24px pitch centered in the box.

### 5.5 Derivation helpers

```ts
export const hash = (s: string): number => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
export const colorFor = (n: Node): ColorKey => n.colorKey ?? PALETTE[hash(n.id) % PALETTE.length].key
export const markFor  = (n: Node): MarkKind => n.markKind ?? MARK_KINDS[hash(n.id + 'm') % MARK_KINDS.length]
export const sizeFor  = (id: string) => (['S', 'M', 'L'] as const)[hash(id + 's') % 3]
```

### 5.6 Tokens (CSS variables — `design/tokens.css`)

```css
:root {
  /* chrome (light) */
  --canvas: #FAF9F6; --ink: #1A1A18;
  --text-1: #1A1A18; --text-2: #6E6E68; --text-3: #A8A7A0;
  --hairline: rgba(26,26,24,.10);
  /* type */
  --font: -apple-system, "SF Pro Text", "PingFang SC", system-ui, sans-serif;
  /* space */
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:20px; --s6:24px; --s8:32px;
  /* radius */
  --r-card:20px; --r-sheet:24px; --r-pill:999px;
  /* motion */
  --dur-zoom:420ms; --dur-micro:200ms; --ease:cubic-bezier(.22,.61,.36,1);
}
@media (prefers-color-scheme: dark) {
  :root { --canvas:#141414; --ink:#ECEAE3; --text-1:#ECEAE3; --text-2:#A4A29B; --text-3:#6F6E68; --hairline:rgba(255,255,255,.12); }
}
```

Typography: **two weights only — 400 / 500.** Sizes: header 17–20/500, card title 18/500, subtitle 13/400, date 12/400. Sentence case; no ALL CAPS.

### 5.7 Motion

- Drill in/out: shared element via Motion `layoutId`; `--dur-zoom` + `--ease`.
- Children enter: opacity + small translateY, 40ms stagger.
- `AnimatePresence` for screen transitions.
- Spring for drag.
- Respect `prefers-reduced-motion`: replace transforms with instant + opacity-only.

---

## 6. Persistence

- **Store**: Zustand 5 with `persist` middleware. Storage adapter over **idb-keyval** (IndexedDB), key `zhixing/tree/v1`. Persist `{ nodes, rootIds }` and the current `path`.
- **Undo/redo**: `zundo` (`temporal`) wrapping the tree slice.
- **Export**: serialize `{ version: 1, nodes, rootIds }` → pretty JSON → download `知行-YYYYMMDD.json`.
- **Import**: file picker → `JSON.parse` → validate with zod (`TreeSchema`) → confirm dialog (`导入将替换当前全部内容，确定吗？`) → replace store. Wrap in try/catch; on failure show `文件无法读取，请检查是否为知行导出的 JSON`.
- **Why export/import matters**: iOS may evict PWA storage; export is the backup path. Surface a gentle reminder in Settings.

```ts
// features/tree/schema.ts
import { z } from 'zod'
export const NodeSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  subtitle: z.string().optional(),
  colorKey: z.string().optional(),
  markKind: z.string().optional(),
  childIds: z.array(z.string()),
  createdAt: z.number().int(),
})
export const TreeSchema = z.object({
  version: z.literal(1),
  nodes: z.record(z.string(), NodeSchema),
  rootIds: z.array(z.string()),
})
```

---

## 7. PWA

`index.html` head (essentials):

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#FAF9F6" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#141414" media="(prefers-color-scheme: dark)" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="知行" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />
```

- Use **vite-plugin-pwa** (`registerType: 'autoUpdate'`, Workbox precache the app shell). No runtime network caching needed (data is local).
- `manifest.webmanifest`: `name: "知行"`, `short_name: "知行"`, `display: "standalone"`, `orientation: "portrait"`, `background_color: "#FAF9F6"`, `theme_color: "#FAF9F6"`, icons `192`, `512`, `512 maskable`, plus `apple-touch-icon` 180.
- Apply `env(safe-area-inset-*)` to header top padding and bottom add-card area.
- Disable overscroll bounce / text selection on app chrome for native feel (`overscroll-behavior: none`, `user-select: none` on non-input UI).

---

## 8. Tech stack & project structure

Stack: **Vite + React + TypeScript**, **Motion** (`motion/react`), **Zustand** + **zundo**, **idb-keyval**, **zod**, **@dnd-kit**, **nanoid**, **vite-plugin-pwa**. Styling: **CSS variables + CSS Modules** (no utility-class soup; precise control of the custom look). Tests: **Vitest** + **@testing-library/react** + jsdom; **Playwright** for e2e. Lint/format: ESLint + Prettier.

```
src/
  main.tsx
  app/
    App.tsx
    AppShell.tsx            # header + current grid + AnimatePresence
  features/
    tree/
      types.ts
      visuals.ts            # PALETTE, MARK_KINDS, hash, colorFor/markFor/sizeFor
      treeOps.ts            # pure immutable ops
      treeOps.test.ts
      schema.ts             # zod
      seed.ts               # first-run starter tree
      useTreeStore.ts       # zustand + persist(idb) + zundo
      useTreeStore.test.ts
    navigation/
      useNavigation.ts      # path state <-> History API
      Header.tsx
    cards/
      CardGrid.tsx          # 2-col masonry
      Card.tsx
      AddCard.tsx
      masonry.ts            # distribute()
      masonry.test.ts
    marks/
      Mark.tsx              # renders by MarkKind
      shapes/               # one small component per shape
    editing/
      EditSheet.tsx
      useDrag.ts            # @dnd-kit wiring (reorder + reparent)
    settings/
      SettingsSheet.tsx
      exportImport.ts
      exportImport.test.ts
    persistence/
      idbStorage.ts
  design/
    tokens.css
    global.css
  lib/
    id.ts                   # nanoid
    date.ts                 # formatDate
  strings.ts                # all Chinese UI copy in one place (no hardcoded strings in components)
public/
  manifest.webmanifest
  icons/ …
tests/e2e/ …
```

Store shape:

```ts
// useTreeStore.ts
interface Store extends TreeState {
  addNode: (parentId: string | null, init?: Partial<Node>) => string
  updateNode: (id: string, patch: Partial<Pick<Node,'title'|'subtitle'|'colorKey'|'markKind'>>) => void
  removeNode: (id: string) => void
  moveNode: (id: string, newParentId: string | null, index: number) => void
  reorder: (parentId: string | null, from: number, to: number) => void
}
// actions delegate to treeOps and set(new state); wrapped by zundo temporal + persist(idb)
```

---

## 9. Coding standards (must follow)

- **Immutability**: never mutate state/props/args; all tree ops return new objects (immer allowed — yields immutable updates).
- **Small files**: 200–400 lines typical, 800 max; one concern per file; organize by feature (above).
- **Small functions**: < 50 lines; nesting ≤ 4 levels.
- **Error handling**: wrap risky ops (JSON parse, file IO, IndexedDB) in try/catch; surface user-friendly Chinese messages; no silent catches.
- **Validation**: zod for any imported/loaded external JSON.
- **No `console.log`** in committed code (use a tiny `lib/log.ts` no-op in prod, or remove).
- **No hardcoded values**: colors/space/radius/motion via tokens; **all UI copy in `strings.ts`**.
- **Naming**: descriptive, intention-revealing.
- TypeScript strict mode on; no `any` in domain code.

---

## 10. UI copy (中文，集中放 `strings.ts`)

- Wordmark: `知行`
- Add card: `添加`  / Add domain (root): `添加领域`
- Empty grid: title `还没有卡片`, body `点下面的「添加」，放进第一张。`, button `添加`
- Edit sheet: `标题` / `副标题（可选）` / `颜色` / `标记` / `删除`
- Delete confirm: `删除「{title}」及其全部内容？此操作可撤销。`
- Undo toast: `已删除 · 撤销`
- Settings: `导出` / `导入` / `外观` / `关于` ; export reminder: `iOS 可能清理本地数据，建议偶尔导出备份。`
- Import confirm: `导入将替换当前全部内容，确定吗？`

---

## 11. Testing (target ≥ 80% coverage)

- **Unit** (Vitest): `treeOps` (add/update/remove-subtree/move/reorder, cycle guard), `hash`/`colorFor`/`markFor`/`sizeFor` determinism, `masonry.distribute` balancing, `formatDate`, `schema` accept/reject, `exportImport` round-trip.
- **Component** (RTL): `Card` renders title/subtitle/date/mark + correct palette; `CardGrid` two-column distribution + Add card; `EditSheet` edits propagate; navigation push/pop.
- **E2E** (Playwright): first-run seed visible → add a card → drill in & out (animation completes) → rename → change color → delete + undo → reorder → export then import (round-trip) → reload offline (PWA shell + data persist).
- CI runs lint + typecheck + unit + e2e.

---

## 12. Milestones (each shippable & tested)

- **M0 — Setup**: Vite+React+TS, ESLint/Prettier, tokens/global CSS, Vitest+Playwright config, vite-plugin-pwa scaffold, empty app shell.
- **M1 — Domain core**: `types`, `visuals`, `treeOps` (+tests), `schema`, `seed`, `useTreeStore` (persist+zundo) (+tests). No UI beyond a debug dump.
- **M2 — Read UI**: `Mark`, `Card`, `CardGrid` masonry (错位), `Header`, navigation with Motion zoom + stagger, dark mode, empty state. Read-only browsing over the seed.
- **M3 — Editing**: `AddCard` inline create, `EditSheet` (rename/subtitle/color/mark/delete + confirm), undo toast, drag reorder + reparent via @dnd-kit (cycle guard).
- **M4 — Persistence & PWA**: verify IndexedDB round-trip, export/import JSON, manifest + icons + service worker, iOS install + offline reload, safe-area insets.
- **M5 — Polish**: animation timing, reduced-motion, a11y pass (labels/focus/44px), performance (avoid layout thrash; transforms/opacity only), final QA against acceptance.

---

## 13. Acceptance criteria

- Open app → see a 2-col **staggered** grid of cream cards; each card shows bold title, optional subtitle, a large mark, and a creation date bottom-left.
- Tap a card → smooth zoom into its children grid; back gesture/zooms out; state survives reload (path + data).
- Add / rename / set subtitle / change color / change mark / delete (with undo) all work and persist.
- Reorder within a level and reparent across levels work; reparent cannot create a cycle.
- Export produces a JSON that re-imports to an identical tree.
- Installs to iOS home screen; launches standalone full-screen; works fully offline; respects safe areas; light + dark both correct.
- `prefers-reduced-motion` disables transform animations.
- Coverage ≥ 80%; lint + typecheck clean; no `console.log`.

---

## 14. First-run seed (`seed.ts`)

Seed a small starter tree (all deletable). Generate ids with nanoid; `createdAt = Date.now()`. Suggested:

- 工作 — 专注与产出 → 深度工作, 沟通协作
- 日常 — 照顾好自己 → 身体, 家
- 聊天 — 与人连接 → 家人, 朋友
- 成长 — 成为想成为的人 → 阅读, 学习

Leave color/mark unset (derived from id) so the seed already looks varied.

---

## 15. Open decisions (defaults chosen here — change if wrong)

1. **No 「此刻」/ suggestion in v1** (just cards); model forward-compatible.
2. **No long note field**; a leaf (no children) opens an **empty grid + Add**. (Add an optional `note` later if bottom-level text is wanted.)
3. **Color/mark auto-assigned from id** on create, user-overridable; **height tier always derived from id** (stable 错位).
4. **Bottom-left = creation date**, format `2026.6.29`.
5. **First run seeds** the starter tree above (deletable).
6. **Dark mode** keeps cards in cream fills on a dark canvas (only chrome flips).
