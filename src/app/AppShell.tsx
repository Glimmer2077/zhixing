import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useMemo } from 'react'

import { CardGrid } from '../features/cards/CardGrid'
import { Header } from '../features/navigation/Header'
import { useNavigation } from '../features/navigation/useNavigation'
import { childrenOf } from '../features/tree/treeOps'
import { createSeedTree } from '../features/tree/seed'
import type { TreeState } from '../features/tree/types'
import { STRINGS } from '../strings'
import styles from './AppShell.module.css'

export function AppShell() {
  const tree = useMemo<TreeState>(() => createSeedTree(), [])
  const { path, push, pop } = useNavigation()
  const prefersReducedMotion = useReducedMotion()
  const currentId = path.at(-1) ?? null
  const currentNode = currentId ? tree.nodes[currentId] : null
  const visibleNodes = childrenOf(tree, currentId)
  const screenKey = currentId ?? 'root'

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
            onOpen={push}
          />
        </motion.section>
      </AnimatePresence>
    </main>
  )
}
