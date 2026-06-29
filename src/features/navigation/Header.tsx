import { STRINGS } from '../../strings'
import styles from './Header.module.css'

interface HeaderProps {
  title: string | null
  canGoBack: boolean
  onBack: () => void
  onSettings: () => void
}

export function Header({ title, canGoBack, onBack, onSettings }: HeaderProps) {
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
      <button
        className={styles.settings}
        type="button"
        aria-label={STRINGS.settings}
        onClick={onSettings}
      >
        <span aria-hidden="true">…</span>
      </button>
    </header>
  )
}
