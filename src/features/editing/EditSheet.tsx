import { useEffect, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { STRINGS } from '../../strings'
import type { ColorKey, EditableNodePatch, MarkKind, Node } from '../tree/types'
import { MARK_KINDS, PALETTE, colorFor, markFor } from '../tree/visuals'
import styles from './EditSheet.module.css'

export const ROOT_PARENT_VALUE = '__root__'

export interface ParentOption {
  id: string | null
  label: string
}

interface EditSheetProps {
  node: Node
  onClose: () => void
  onDelete: (id: string) => void
  parentId: string | null
  parentOptions: ParentOption[]
  onSave: (patch: EditableNodePatch, parentId: string | null) => void
}

export function EditSheet({
  node,
  onClose,
  onDelete,
  parentId,
  parentOptions,
  onSave,
}: EditSheetProps) {
  const prefersReducedMotion = useReducedMotion()
  const [title, setTitle] = useState(node.title)
  const [subtitle, setSubtitle] = useState(node.subtitle ?? '')
  const [colorKey, setColorKey] = useState<ColorKey>(colorFor(node))
  const [markKind, setMarkKind] = useState<MarkKind>(markFor(node))
  const [selectedParent, setSelectedParent] = useState(parentValue(parentId))
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const nextTitle = title.trim()
    if (!nextTitle) {
      return
    }

    onSave(
      {
        title: nextTitle,
        subtitle: subtitle.trim() || undefined,
        colorKey,
        markKind,
      },
      parseParentValue(selectedParent),
    )
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
          aria-label={STRINGS.editCard}
          aria-modal="true"
          className={styles.sheet}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
          role="dialog"
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <div className={styles.header}>
            <h2>{STRINGS.editCard}</h2>
            <button
              aria-label={STRINGS.close}
              className={styles.iconButton}
              onClick={onClose}
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <form className={styles.form} onSubmit={submit}>
            <label className={styles.field}>
              <span>{STRINGS.title}</span>
              <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>

            <label className={styles.field}>
              <span>{STRINGS.subtitle}</span>
              <input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} />
            </label>

            <fieldset className={styles.optionGroup}>
              <legend>{STRINGS.color}</legend>
              <div className={styles.swatches}>
                {PALETTE.map((entry) => (
                  <label className={styles.swatchOption} key={entry.key}>
                    <input
                      aria-label={entry.key}
                      checked={colorKey === entry.key}
                      name="color"
                      onChange={() => setColorKey(entry.key)}
                      type="radio"
                    />
                    <span
                      className={styles.swatch}
                      style={{ background: entry.fill, color: entry.title }}
                    >
                      {colorKey === entry.key ? '✓' : ''}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.optionGroup}>
              <legend>{STRINGS.mark}</legend>
              <div className={styles.markOptions}>
                {MARK_KINDS.map((kind) => (
                  <label className={styles.markOption} key={kind}>
                    <input
                      aria-label={kind}
                      checked={markKind === kind}
                      name="mark"
                      onChange={() => setMarkKind(kind)}
                      type="radio"
                    />
                    <span>{kind}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className={styles.field}>
              <span>{STRINGS.moveTo}</span>
              <select
                value={selectedParent}
                onChange={(event) => setSelectedParent(event.target.value)}
              >
                {parentOptions.map((option) => (
                  <option key={parentValue(option.id)} value={parentValue(option.id)}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {isConfirmingDelete ? (
              <div className={styles.confirm}>
                <p>{`删除「${node.title}」及其全部内容？此操作可撤销。`}</p>
                <button
                  className={styles.deleteConfirm}
                  onClick={() => onDelete(node.id)}
                  type="button"
                >
                  {STRINGS.confirmDelete}
                </button>
              </div>
            ) : null}

            <div className={styles.actions}>
              <button
                className={styles.deleteButton}
                onClick={() => setIsConfirmingDelete(true)}
                type="button"
              >
                {STRINGS.delete}
              </button>
              <button className={styles.doneButton} type="submit">
                {STRINGS.done}
              </button>
            </div>
          </form>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  )
}

const parentValue = (id: string | null): string => id ?? ROOT_PARENT_VALUE

const parseParentValue = (value: string): string | null =>
  value === ROOT_PARENT_VALUE ? null : value
