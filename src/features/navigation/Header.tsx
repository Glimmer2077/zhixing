import type { Ref } from 'react'

import { STRINGS } from '../../strings'
import styles from './Header.module.css'

interface HeaderProps {
  title: string | null
  canGoBack: boolean
  canRedo?: boolean
  canUndo?: boolean
  onBack: () => void
  onRedo?: () => void
  onSettings: () => void
  onUndo?: () => void
  settingsButtonRef?: Ref<HTMLButtonElement>
}

export function Header({
  title,
  canGoBack,
  canRedo = false,
  canUndo = false,
  onBack,
  onRedo,
  onSettings,
  onUndo,
  settingsButtonRef,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {canGoBack ? (
          <button className={styles.back} type="button" aria-label={STRINGS.back} onClick={onBack}>
            <span aria-hidden="true">‹</span>
          </button>
        ) : null}
        <h1 className={styles.title}>{title ?? STRINGS.wordmark}</h1>
      </div>
      <div className={styles.actions}>
        {canUndo ? (
          <button
            aria-label={STRINGS.undoAction}
            className={styles.history}
            onClick={onUndo}
            title={STRINGS.undoAction}
            type="button"
          >
            <span aria-hidden="true">↶</span>
          </button>
        ) : null}
        {canRedo ? (
          <button
            aria-label={STRINGS.redoAction}
            className={styles.history}
            onClick={onRedo}
            title={STRINGS.redoAction}
            type="button"
          >
            <span aria-hidden="true">↷</span>
          </button>
        ) : null}
        <button
          className={styles.settings}
          ref={settingsButtonRef}
          type="button"
          aria-label={STRINGS.settings}
          onClick={onSettings}
        >
          <span aria-hidden="true">…</span>
        </button>
      </div>
    </header>
  )
}
