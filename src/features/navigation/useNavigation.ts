import { useCallback, useEffect, useState } from 'react'

const STATE_KEY = 'zhixingPath'

interface HistoryState {
  [STATE_KEY]?: string[]
}

export function useNavigation() {
  const [path, setPath] = useState<string[]>([])

  useEffect(() => {
    replaceHistoryPath([])

    const handlePopState = (event: PopStateEvent) => {
      const nextPath = pathFromState(event.state)
      setPath(nextPath)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const push = useCallback((id: string) => {
    setPath((currentPath) => {
      const nextPath = [...currentPath, id]
      window.history.pushState({ [STATE_KEY]: nextPath }, '', window.location.href)
      return nextPath
    })
  }, [])

  const pop = useCallback(() => {
    setPath((currentPath) => {
      const nextPath = currentPath.slice(0, -1)
      replaceHistoryPath(nextPath)
      return nextPath
    })
  }, [])

  return { path, push, pop }
}

const replaceHistoryPath = (path: string[]) => {
  window.history.replaceState({ [STATE_KEY]: path }, '', window.location.href)
}

const pathFromState = (state: unknown): string[] => {
  const value = (state as HistoryState | null)?.[STATE_KEY]
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : []
}
