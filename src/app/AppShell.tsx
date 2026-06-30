import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useStore } from 'zustand'

import { CardGrid } from '../features/cards/CardGrid'
import {
  applyThemePreference,
  readThemePreference,
  writeThemePreference,
  type ThemePreference,
} from '../features/appearance/theme'
import { EditSheet, type ParentOption } from '../features/editing/EditSheet'
import { Header } from '../features/navigation/Header'
import { canStartSwipeBack, shouldTriggerSwipeDownBack } from '../features/navigation/swipeBack'
import { useNavigation } from '../features/navigation/useNavigation'
import { exportFileName } from '../features/persistence/exportFileName'
import { indexedDbTreeStorage, type TreeStorage } from '../features/persistence/treeStorage'
import { exportTreeToJson, importTreeFromJson } from '../features/persistence/treeTransfer'
import { SettingsSheet } from '../features/settings/SettingsSheet'
import {
  commitTree,
  createTreeHistoryStore,
  replaceTreeWithoutHistory,
  type TreeUpdater,
} from '../features/tree/treeHistory'
import {
  addNode,
  childrenOf,
  isDescendant,
  moveNode,
  parentOf,
  pathTo,
  removeNode,
  reorderSiblingsById,
  updateNode,
} from '../features/tree/treeOps'
import { createSeedTree } from '../features/tree/seed'
import type { EditableNodePatch, TreeState } from '../features/tree/types'
import { STRINGS } from '../strings'
import styles from './AppShell.module.css'

interface AppShellProps {
  storage?: TreeStorage
}

export function AppShell({ storage = indexedDbTreeStorage }: AppShellProps = {}) {
  const initialTree = useMemo<TreeState>(() => createSeedTree(), [])
  const [treeStore] = useState(() => createTreeHistoryStore(initialTree))
  const tree = useStore(treeStore, (state) => state.tree)
  const undoDepth = useStore(treeStore.temporal, (state) => state.pastStates.length)
  const redoDepth = useStore(treeStore.temporal, (state) => state.futureStates.length)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [historyNotice, setHistoryNotice] = useState<string | null>(null)
  const [themePreference, setThemePreference] = useState<ThemePreference>(() =>
    readThemePreference(),
  )
  const swipeStartRef = useRef<{ pointerId: number; x: number; y: number } | null>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)
  const { path, push, pop, reset } = useNavigation()
  const prefersReducedMotion = useReducedMotion()
  const currentId = path.at(-1) ?? null
  const currentNode = currentId ? tree.nodes[currentId] : null
  const editingNode = editingId ? tree.nodes[editingId] : null
  const editingParentId = editingId ? (parentOf(tree, editingId) ?? null) : null
  const parentOptions = editingId ? parentOptionsFor(tree, editingId) : []
  const visibleNodes = childrenOf(tree, currentId)
  const screenKey = currentId ?? 'root'
  const canUndo = undoDepth > 0
  const canRedo = redoDepth > 0

  useEffect(() => {
    let isActive = true

    storage
      .load()
      .then((storedTree) => {
        if (!isActive) {
          return
        }
        if (storedTree) {
          replaceTreeWithoutHistory(treeStore, storedTree)
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (isActive) {
          setHasHydrated(true)
        }
      })

    return () => {
      isActive = false
    }
  }, [storage, treeStore])

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    void storage.save(tree).catch(() => undefined)
  }, [hasHydrated, storage, tree])

  useEffect(() => {
    if (!hasHydrated || path.length === 0 || isValidPath(tree, path)) {
      return
    }

    reset()
  }, [hasHydrated, path, reset, tree])

  useEffect(() => {
    applyThemePreference(themePreference)
    writeThemePreference(themePreference)
  }, [themePreference])

  const applyTreeChange = (updater: TreeUpdater, notice: string = STRINGS.changedUndo) => {
    const previousTree = treeStore.getState().tree
    commitTree(treeStore, updater)
    if (treeStore.getState().tree !== previousTree) {
      setHistoryNotice(notice)
    }
  }

  const undoTree = () => {
    treeStore.temporal.getState().undo()
    setHistoryNotice(null)
  }

  const redoTree = () => {
    treeStore.temporal.getState().redo()
    setHistoryNotice(null)
  }

  const openEdit = (id: string) => {
    setHistoryNotice(null)
    setEditingId(id)
  }

  const startSwipeBack = (event: ReactPointerEvent<HTMLElement>) => {
    if (path.length === 0 || editingNode || isSettingsOpen || !canStartSwipeBack(event.target)) {
      swipeStartRef.current = null
      return
    }

    swipeStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    }
  }

  const finishSwipeBack = (event: ReactPointerEvent<HTMLElement>) => {
    const start = swipeStartRef.current
    swipeStartRef.current = null
    if (!start || start.pointerId !== event.pointerId || path.length === 0) {
      return
    }

    if (
      shouldTriggerSwipeDownBack({
        end: { x: event.clientX, y: event.clientY },
        start,
      })
    ) {
      pop()
    }
  }

  const cancelSwipeBack = () => {
    swipeStartRef.current = null
  }

  const addCard = (title: string) => {
    applyTreeChange((currentTree) => addNode(currentTree, currentId, { title }).state)
  }

  const saveEdit = (patch: EditableNodePatch, targetParentId: string | null) => {
    if (!editingId) {
      return
    }
    applyTreeChange((currentTree) => {
      const updated = updateNode(currentTree, editingId, patch)
      const currentParentId = parentOf(updated, editingId)
      if (currentParentId === undefined || currentParentId === targetParentId) {
        return updated
      }
      return moveNode(updated, editingId, targetParentId, Number.POSITIVE_INFINITY)
    })
    setEditingId(null)
  }

  const reorderCards = (activeId: string, overId: string) => {
    if (activeId === overId) {
      return
    }
    applyTreeChange((currentTree) => reorderSiblingsById(currentTree, currentId, activeId, overId))
  }

  const reparentCard = (activeId: string, targetParentId: string) => {
    if (activeId === targetParentId) {
      return
    }
    applyTreeChange((currentTree) =>
      moveNode(currentTree, activeId, targetParentId, Number.POSITIVE_INFINITY),
    )
  }

  const deleteNode = (id: string) => {
    applyTreeChange((currentTree) => removeNode(currentTree, id), STRINGS.deletedUndo)
    setEditingId(null)
  }

  const exportTree = () => {
    const blob = new Blob([exportTreeToJson(tree)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = exportFileName()
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const importTree = async (file: File) => {
    try {
      const importedTree = importTreeFromJson(await file.text())
      applyTreeChange(importedTree)
      setEditingId(null)
      setImportError(null)
      setIsSettingsOpen(false)
      reset()
    } catch {
      setImportError(STRINGS.importFailed)
    }
  }

  const resetData = () => {
    applyTreeChange(initialTree)
    setEditingId(null)
    setImportError(null)
    setIsSettingsOpen(false)
    reset()
  }

  return (
    <main
      className={styles.shell}
      aria-label={STRINGS.appName}
      onPointerCancel={cancelSwipeBack}
      onPointerDown={startSwipeBack}
      onPointerUp={finishSwipeBack}
    >
      <Header
        title={currentNode?.title ?? null}
        canGoBack={path.length > 0}
        canRedo={canRedo}
        canUndo={canUndo}
        onBack={pop}
        onRedo={redoTree}
        onSettings={() => {
          setHistoryNotice(null)
          setImportError(null)
          setIsSettingsOpen(true)
        }}
        onUndo={undoTree}
        settingsButtonRef={settingsButtonRef}
      />
      <AnimatePresence mode="wait">
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className={styles.content}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
          key={screenKey}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <CardGrid
            addLabel={currentId ? STRINGS.addCard : STRINGS.addDomain}
            nodes={visibleNodes}
            onAdd={addCard}
            onEdit={openEdit}
            onOpen={push}
            onReparent={reparentCard}
            onReorder={reorderCards}
          />
        </motion.section>
      </AnimatePresence>
      {editingNode ? (
        <EditSheet
          node={editingNode}
          onClose={() => setEditingId(null)}
          onDelete={deleteNode}
          parentId={editingParentId}
          parentOptions={parentOptions}
          onSave={saveEdit}
        />
      ) : null}
      {historyNotice && canUndo && !editingNode && !isSettingsOpen ? (
        <div className={styles.toast} role="status">
          <span>{historyNotice}</span>
          <button onClick={undoTree} type="button">
            {STRINGS.undo}
          </button>
        </div>
      ) : null}
      {isSettingsOpen ? (
        <SettingsSheet
          importError={importError}
          onClose={() => setIsSettingsOpen(false)}
          onExport={exportTree}
          onImportFile={(file) => void importTree(file)}
          onReset={resetData}
          onThemePreferenceChange={setThemePreference}
          returnFocusRef={settingsButtonRef}
          themePreference={themePreference}
        />
      ) : null}
    </main>
  )
}

const parentOptionsFor = (tree: TreeState, movingId: string): ParentOption[] => [
  { id: null, label: STRINGS.rootLevel },
  ...Object.values(tree.nodes)
    .filter((node) => node.id !== movingId && !isDescendant(tree, movingId, node.id))
    .map((node) => ({
      id: node.id,
      label: pathTo(tree, node.id)
        .map((pathNode) => pathNode.title)
        .join(' / '),
    })),
]

const isValidPath = (tree: TreeState, path: string[]): boolean =>
  path.every((id, index) => {
    if (!tree.nodes[id]) {
      return false
    }

    if (index === 0) {
      return tree.rootIds.includes(id)
    }

    const parentId = path[index - 1]
    return Boolean(parentId && tree.nodes[parentId]?.childIds.includes(id))
  })
