import { useEffect, useRef, useCallback, useState } from "react"

const WS_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000")
  .replace(/^http/, "ws")

export interface AppHealthUpdate {
  app_id: string
  name: string
  health_score: number
  status: string
  latency_p99: number
  uptime: number
  rpm: number
}

export interface HealthSummaryUpdate {
  total_apps: number
  healthy_apps: number
  warning_apps: number
  critical_apps: number
  avg_health_score: number
  avg_latency: number
}

export interface HealthSocketPayload {
  type: "health_update" | "connected"
  summary?: HealthSummaryUpdate
  apps?: AppHealthUpdate[]
  message?: string
  app_count?: number
}

export interface UseHealthSocketOptions {
  token: string | null
  onUpdate?: (payload: HealthSocketPayload) => void
  enabled?: boolean
}

export interface UseHealthSocketReturn {
  connected: boolean
  lastUpdate: HealthSocketPayload | null
  appHealthMap: Record<string, AppHealthUpdate>
  summary: HealthSummaryUpdate | null
}

const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000]

export function useHealthSocket({
  token,
  onUpdate,
  enabled = true,
}: UseHealthSocketOptions): UseHealthSocketReturn {
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<HealthSocketPayload | null>(null)
  const [appHealthMap, setAppHealthMap] = useState<Record<string, AppHealthUpdate>>({})
  const [summary, setSummary] = useState<HealthSummaryUpdate | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const retryCountRef = useRef(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
  }, [])

  const disconnect = useCallback(() => {
    clearRetryTimer()
    if (wsRef.current) {
      wsRef.current.onopen = null
      wsRef.current.onmessage = null
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.close()
      wsRef.current = null
    }
  }, [clearRetryTimer])

  const connect = useCallback(() => {
    if (!token || !enabled || !mountedRef.current) return
    disconnect()

    const url = `${WS_BASE}/ws/health?token=${encodeURIComponent(token)}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) return
      retryCountRef.current = 0
      setConnected(true)
    }

    ws.onmessage = (event) => {
      if (!mountedRef.current) return
      try {
        const payload: HealthSocketPayload = JSON.parse(event.data)
        setLastUpdate(payload)

        if (payload.type === "health_update") {
          if (payload.apps) {
            setAppHealthMap((prev) => {
              const next = { ...prev }
              for (const app of payload.apps!) {
                next[app.app_id] = app
              }
              return next
            })
          }
          if (payload.summary) {
            setSummary(payload.summary)
          }
        }

        onUpdate?.(payload)
      } catch {
        // ignore parse errors
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setConnected(false)
      wsRef.current = null

      const delay = RECONNECT_DELAYS[Math.min(retryCountRef.current, RECONNECT_DELAYS.length - 1)]
      retryCountRef.current += 1

      retryTimerRef.current = setTimeout(() => {
        if (mountedRef.current) connect()
      }, delay)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [token, enabled, disconnect, onUpdate])

  useEffect(() => {
    mountedRef.current = true

    if (token && enabled) {
      connect()
    }

    return () => {
      mountedRef.current = false
      disconnect()
    }
  }, [token, enabled, connect, disconnect])

  return { connected, lastUpdate, appHealthMap, summary }
}
