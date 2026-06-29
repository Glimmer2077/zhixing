import { useEffect, useState, type ChangeEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { STRINGS } from '../../strings'
import styles from './SettingsSheet.module.css'

interface SettingsSheetProps {
  importError: string | null
  onClose: () => void
  onExport: () => void
  onImportFile: (file: File) => void
  onReset: () => void
}

export function SettingsSheet({
  importError,
  onClose,
  onExport,
  onImportFile,
  onReset,
}: SettingsSheetProps) {
  const prefersReducedMotion = useReducedMotion()
  const [isConfirmingReset, setIsConfirmingReset] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const importFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) {
      onImportFile(file)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        className={styles.backdrop}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
      >
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          aria-label={STRINGS.settings}
          aria-modal="true"
          className={styles.sheet}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
          role="dialog"
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <div className={styles.header}>
            <h2>{STRINGS.settings}</h2>
            <button
              aria-label={STRINGS.close}
              className={styles.iconButton}
              onClick={onClose}
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className={styles.actions}>
            <button className={styles.actionButton} onClick={onExport} type="button">
              {STRINGS.exportJson}
            </button>
            <label className={styles.importButton}>
              <span>{STRINGS.importJson}</span>
              <input accept="application/json,.json" onChange={importFile} type="file" />
            </label>
          </div>

          {importError ? (
            <p className={styles.error} role="alert">
              {importError}
            </p>
          ) : null}

          <div className={styles.dangerZone}>
            {isConfirmingReset ? (
              <div className={styles.resetConfirm}>
                <p>{STRINGS.resetDataPrompt}</p>
                <button className={styles.dangerButton} onClick={onReset} type="button">
                  {STRINGS.confirmResetData}
                </button>
              </div>
            ) : (
              <button
                className={styles.ghostDangerButton}
                onClick={() => setIsConfirmingReset(true)}
                type="button"
              >
                {STRINGS.resetData}
              </button>
            )}
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  )
}
