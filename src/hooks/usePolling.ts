import { useEffect, useRef, useCallback } from "react"

interface UsePollingOptions {
  interval?: number
  enabled?: boolean
  immediate?: boolean
}

export function usePolling(
  callback: () => void,
  { interval = 30000, enabled = true, immediate = false }: UsePollingOptions = {}
) {
  const callbackRef = useRef(callback)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    stop()
    if (!enabled) return
    timerRef.current = setInterval(() => callbackRef.current(), interval)
  }, [enabled, interval, stop])

  useEffect(() => {
    if (!enabled) {
      stop()
      return
    }
    if (immediate) callbackRef.current()
    start()
    return stop
  }, [enabled, immediate, start, stop])
}
