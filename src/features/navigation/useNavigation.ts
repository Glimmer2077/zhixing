import { useCallback, useEffect, useState } from 'react'

export const PATH_STORAGE_KEY = 'zhixing.path.v1'

const HISTORY_STATE_KEY = 'zhixingPath'

interface HistoryState {
  [HISTORY_STATE_KEY]?: string[]
}

export function useNavigation() {
  const [path, setPath] = useState<string[]>(() => readStoredPath())

  useEffect(() => {
    replaceHistoryPath(readStoredPath())

    const handlePopState = (event: PopStateEvent) => {
      const nextPath = pathFromState(event.state)
      writeStoredPath(nextPath)
      setPath(nextPath)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const push = useCallback((id: string) => {
    setPath((currentPath) => {
      const nextPath = [...currentPath, id]
      writeStoredPath(nextPath)
      window.history.pushState({ [HISTORY_STATE_KEY]: nextPath }, '', window.location.href)
      return nextPath
    })
  }, [])

  const pop = useCallback(() => {
    setPath((currentPath) => {
      const nextPath = currentPath.slice(0, -1)
      writeStoredPath(nextPath)
      replaceHistoryPath(nextPath)
      return nextPath
    })
  }, [])

  const reset = useCallback(() => {
    setPath([])
    writeStoredPath([])
    replaceHistoryPath([])
  }, [])

  return { path, push, pop, reset }
}

const replaceHistoryPath = (path: string[]) => {
  window.history.replaceState({ [HISTORY_STATE_KEY]: path }, '', window.location.href)
}

const pathFromState = (state: unknown): string[] => {
  const value = (state as HistoryState | null)?.[HISTORY_STATE_KEY]
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : []
}

const readStoredPath = (): string[] => {
  try {
    const storedValue = window.localStorage.getItem(PATH_STORAGE_KEY)
    if (!storedValue) {
      return []
    }

    const parsedValue: unknown = JSON.parse(storedValue)
    if (isPath(parsedValue)) {
      return parsedValue
    }
  } catch {
    // Fall through to repair invalid or unavailable local storage state.
  }

  writeStoredPath([])
  return []
}

const writeStoredPath = (path: string[]) => {
  try {
    window.localStorage.setItem(PATH_STORAGE_KEY, JSON.stringify(path))
  } catch {
    // Navigation should still work if local storage is unavailable.
  }
}

const isPath = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')
