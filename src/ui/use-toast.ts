import { useState, useCallback } from 'react'

interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

interface ToastEntry extends ToastOptions {
  id: string
  open: boolean
  action?: React.ReactElement
}

let count = 0
function genId() {
  return `toast-${++count}`
}

// Module-level listeners so toast() can be called outside React components
type Listener = (toasts: ToastEntry[]) => void
const listeners: Set<Listener> = new Set()
let memoryToasts: ToastEntry[] = []

function dispatch(toasts: ToastEntry[]) {
  memoryToasts = toasts
  listeners.forEach((l) => l(toasts))
}

export function toast(options: ToastOptions) {
  const id = genId()
  const entry: ToastEntry = { ...options, id, open: true }
  dispatch([...memoryToasts, entry])

  if (options.duration !== 0) {
    setTimeout(() => {
      dispatch(memoryToasts.filter((t) => t.id !== id))
    }, options.duration ?? 4000)
  }

  return id
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastEntry[]>(memoryToasts)

  const subscribe = useCallback((listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }, [])

  useState(() => {
    const unsub = subscribe(setToasts)
    return unsub
  })

  return { toasts, toast }
}
