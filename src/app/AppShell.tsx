import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useMemo, useState } from 'react'

import { CardGrid } from '../features/cards/CardGrid'
import { EditSheet } from '../features/editing/EditSheet'
import { Header } from '../features/navigation/Header'
import { useNavigation } from '../features/navigation/useNavigation'
import { addNode, childrenOf, removeNode, updateNode } from '../features/tree/treeOps'
import { createSeedTree } from '../features/tree/seed'
import type { EditableNodePatch, TreeState } from '../features/tree/types'
import { STRINGS } from '../strings'
import styles from './AppShell.module.css'

export function AppShell() {
  const initialTree = useMemo<TreeState>(() => createSeedTree(), [])
  const [tree, setTree] = useState<TreeState>(initialTree)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [undoState, setUndoState] = useState<TreeState | null>(null)
  const { path, push, pop } = useNavigation()
  const prefersReducedMotion = useReducedMotion()
  const currentId = path.at(-1) ?? null
  const currentNode = currentId ? tree.nodes[currentId] : null
  const editingNode = editingId ? tree.nodes[editingId] : null
  const visibleNodes = childrenOf(tree, currentId)
  const screenKey = currentId ?? 'root'

  const addCard = (title: string) => {
    setUndoState(null)
    setTree((currentTree) => addNode(currentTree, currentId, { title }).state)
  }

  const saveEdit = (patch: EditableNodePatch) => {
    if (!editingId) {
      return
    }
    setUndoState(null)
    setTree((currentTree) => updateNode(currentTree, editingId, patch))
    setEditingId(null)
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
          />
        </motion.section>
      </AnimatePresence>
      {editingNode ? (
        <EditSheet
          node={editingNode}
          onClose={() => setEditingId(null)}
          onDelete={deleteNode}
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
