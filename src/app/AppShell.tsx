import { STRINGS } from '../strings'
import styles from './AppShell.module.css'

export function AppShell() {
  return (
    <main className={styles.shell} aria-label={STRINGS.appName}>
      <header className={styles.header}>
        <h1 className={styles.wordmark}>{STRINGS.wordmark}</h1>
      </header>
      <section className={styles.placeholder} aria-label={STRINGS.m0Label}>
        <p>{STRINGS.m0Label}</p>
      </section>
    </main>
  )
}
