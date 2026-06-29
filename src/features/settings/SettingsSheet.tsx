import { useState, type ChangeEvent, type RefObject } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { STRINGS } from '../../strings'
import { useDialogClose } from '../dialog/useDialogClose'
import styles from './SettingsSheet.module.css'

interface SettingsSheetProps {
  importError: string | null
  onClose: () => void
  onExport: () => void
  onImportFile: (file: File) => void
  onReset: () => void
  returnFocusRef?: RefObject<HTMLElement | null>
}

export function SettingsSheet({
  importError,
  onClose,
  onExport,
  onImportFile,
  onReset,
  returnFocusRef,
}: SettingsSheetProps) {
  const prefersReducedMotion = useReducedMotion()
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const [isConfirmingReset, setIsConfirmingReset] = useState(false)
  const closeDialog = useDialogClose(onClose, { returnFocusRef })

  const importFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) {
      setPendingImportFile(file)
    }
  }

  const confirmImport = () => {
    if (!pendingImportFile) {
      return
    }

    onImportFile(pendingImportFile)
    setPendingImportFile(null)
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
          aria-labelledby="settings-sheet-heading"
          aria-modal="true"
          className={styles.sheet}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
          role="dialog"
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <div className={styles.header}>
            <h2 id="settings-sheet-heading">{STRINGS.settings}</h2>
            <button
              aria-label={STRINGS.close}
              autoFocus
              className={styles.iconButton}
              onClick={closeDialog}
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

          <p className={styles.note}>{STRINGS.exportReminder}</p>

          {pendingImportFile ? (
            <div className={styles.confirmPanel}>
              <p>{STRINGS.importConfirm}</p>
              <div className={styles.confirmActions}>
                <button
                  className={styles.secondaryButton}
                  onClick={() => setPendingImportFile(null)}
                  type="button"
                >
                  {STRINGS.cancel}
                </button>
                <button className={styles.actionButton} onClick={confirmImport} type="button">
                  {STRINGS.confirmImport}
                </button>
              </div>
            </div>
          ) : null}

          {importError ? (
            <p className={styles.error} role="alert">
              {importError}
            </p>
          ) : null}

          <section className={styles.about} aria-labelledby="settings-about-heading">
            <h3 id="settings-about-heading">{STRINGS.about}</h3>
            <p>{STRINGS.aboutBody}</p>
          </section>

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
