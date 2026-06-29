import { useCallback, useEffect, useRef, type RefObject } from 'react'

interface DialogCloseOptions {
  returnFocusRef?: RefObject<HTMLElement | null>
}

export function useDialogClose(onClose: () => void, options: DialogCloseOptions = {}) {
  const previousFocusRef = useRef<HTMLElement | null>(
    typeof document === 'undefined'
      ? null
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null,
  )
  const focusTargetRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (previousFocusRef.current) {
      return
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
  }, [])

  useEffect(() => {
    focusTargetRef.current = options.returnFocusRef?.current ?? null
  }, [options.returnFocusRef])

  const closeDialog = useCallback(() => {
    const previousFocus = focusTargetRef.current ?? previousFocusRef.current
    onClose()
    window.setTimeout(() => previousFocus?.focus(), 0)
  }, [onClose])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDialog()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeDialog])

  return closeDialog
}
