import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'

import { CardGrid } from '../features/cards/CardGrid'
import { EditSheet, type ParentOption } from '../features/editing/EditSheet'
import { Header } from '../features/navigation/Header'
import { useNavigation } from '../features/navigation/useNavigation'
import { indexedDbTreeStorage, type TreeStorage } from '../features/persistence/treeStorage'
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
  const [tree, setTree] = useState<TreeState>(initialTree)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [undoState, setUndoState] = useState<TreeState | null>(null)
  const { path, push, pop } = useNavigation()
  const prefersReducedMotion = useReducedMotion()
  const currentId = path.at(-1) ?? null
  const currentNode = currentId ? tree.nodes[currentId] : null
  const editingNode = editingId ? tree.nodes[editingId] : null
  const editingParentId = editingId ? (parentOf(tree, editingId) ?? null) : null
  const parentOptions = editingId ? parentOptionsFor(tree, editingId) : []
  const visibleNodes = childrenOf(tree, currentId)
  const screenKey = currentId ?? 'root'

  useEffect(() => {
    let isActive = true

    storage
      .load()
      .then((storedTree) => {
        if (!isActive) {
          return
        }
        if (storedTree) {
          setTree(storedTree)
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
  }, [storage])

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    void storage.save(tree).catch(() => undefined)
  }, [hasHydrated, storage, tree])

  const addCard = (title: string) => {
    setUndoState(null)
    setTree((currentTree) => addNode(currentTree, currentId, { title }).state)
  }

  const saveEdit = (patch: EditableNodePatch, targetParentId: string | null) => {
    if (!editingId) {
      return
    }
    setUndoState(null)
    setTree((currentTree) => {
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
    setUndoState(null)
    setTree((currentTree) => reorderSiblingsById(currentTree, currentId, activeId, overId))
  }

  const deleteNode = (id: string) => {
    setUndoState(tree)
    setTree(removeNode(tree, id))
    setEditingId(null)
  }

  const undoDelete = () => {
    if (!undoState) {
      return
    }
    setTree(undoState)
    setUndoState(null)
  }

  return (
    <main className={styles.shell} aria-label={STRINGS.appName}>
      <Header title={currentNode?.title ?? null} canGoBack={path.length > 0} onBack={pop} />
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
            onEdit={setEditingId}
            onOpen={push}
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
      {undoState ? (
        <div className={styles.toast} role="status">
          <span>{STRINGS.deletedUndo}</span>
          <button onClick={undoDelete} type="button">
            {STRINGS.undo}
          </button>
        </div>
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
