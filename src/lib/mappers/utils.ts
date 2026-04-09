export function safeString(val: string | null | undefined, fallback = ""): string {
  return (val != null && val !== "") ? String(val) : fallback
}

export function safeNumber(val: number | null | undefined, fallback = 0): number {
  if (val == null) return fallback
  const n = Number(val)
  return isNaN(n) ? fallback : n
}

export function parseNumeric(val: string | number | null | undefined, fallback = 0): number {
  if (val == null) return fallback
  if (typeof val === "number") return isNaN(val) ? fallback : val
  const n = parseFloat(val)
  return isNaN(n) ? fallback : n
}

export function safeArray<T>(arr: T[] | null | undefined): T[] {
  return Array.isArray(arr) ? arr : []
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    const now = Date.now()
    const diff = now - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  } catch {
    return iso
  }
}

const HEALTH_STATUS_MAP: Record<string, string> = {
  healthy: "healthy", ok: "healthy", good: "healthy",
  warning: "warning", warn: "warning", degraded: "warning",
  critical: "critical", error: "critical", down: "critical",
  unknown: "unknown",
}

const SEVERITY_MAP: Record<string, string> = {
  critical: "critical", p1: "critical", high: "critical",
  warning: "warning", warn: "warning", medium: "warning",
  degraded: "degraded", low: "degraded",
  healthy: "healthy", info: "healthy",
}

const INCIDENT_STATUS_MAP: Record<string, string> = {
  active: "active", open: "active", new: "active", firing: "active",
  investigating: "investigating", acknowledged: "investigating", in_progress: "investigating",
  resolved: "resolved", closed: "resolved", fixed: "resolved",
}

const CONNECTOR_STATUS_MAP: Record<string, string> = {
  active: "active", healthy: "active", connected: "active", ok: "active",
  warning: "warning", degraded: "warning", slow: "warning",
  error: "error", failed: "error", disconnected: "error",
  inactive: "inactive", disabled: "inactive", paused: "inactive",
}

export function normalizeHealthStatus(raw: string | null | undefined): string {
  if (!raw) return "unknown"
  return HEALTH_STATUS_MAP[raw.toLowerCase()] ?? "unknown"
}

export function normalizeSeverity(raw: string | null | undefined): string {
  if (!raw) return "warning"
  return SEVERITY_MAP[raw.toLowerCase()] ?? "warning"
}

export function normalizeIncidentStatus(raw: string | null | undefined): string {
  if (!raw) return "active"
  return INCIDENT_STATUS_MAP[raw.toLowerCase()] ?? "active"
}

export function normalizeConnectorStatus(raw: string | null | undefined): string {
  if (!raw) return "inactive"
  return CONNECTOR_STATUS_MAP[raw.toLowerCase()] ?? "inactive"
}

export function normalizeEnvironment(raw: string | null | undefined): string {
  if (!raw) return "Production"
  const map: Record<string, string> = {
    production: "Production", prod: "Production",
    staging: "Staging", stage: "Staging",
    development: "Development", dev: "Development", local: "Development",
  }
  return map[raw.toLowerCase()] ?? raw
}
