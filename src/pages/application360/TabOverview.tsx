import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts"
import { ShieldCheck, Zap, Activity, TriangleAlert as AlertTriangle, TrendingUp, TrendingDown, RefreshCw, CircleCheck as CheckCircle, Circle as XCircle, Radio } from "lucide-react"
import { cn } from "@/lib/utils"
import { HEALTH_SCORE_7D, HEALTH_RULES } from "./data"
import { useApi } from "@/hooks/useApi"
import { getAppOverview, runHealthCheck, type AppHealthCheckResult } from "@/lib/api/apps"
import { mapAppOverview } from "@/lib/mappers"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useHealthSocket } from "@/hooks/useHealthSocket"
import { useAuth } from "@/context/AuthContext"

const CHART_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  }
}

function HealthRing({ score }: { score: number }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color = score >= 90 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444"
  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
      <motion.circle
        cx="64" cy="64" r={r} fill="none"
        stroke={color} strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        transform="rotate(-90 64 64)"
      />
      <text x="64" y="60" textAnchor="middle" fontSize="22" fontWeight="700" fill={color}>{score}</text>
      <text x="64" y="76" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">Health</text>
    </svg>
  )
}

export function TabOverview({ appId }: { appId: string }) {
  const [checkResult, setCheckResult] = useState<AppHealthCheckResult | null>(null)
  const [runningCheck, setRunningCheck] = useState(false)
  const [liveHealthScore, setLiveHealthScore] = useState<number | null>(null)
  const [liveLatency, setLiveLatency] = useState<number | null>(null)
  const [liveUptime, setLiveUptime] = useState<number | null>(null)
  const [liveRpm, setLiveRpm] = useState<number | null>(null)
  const [liveFlash, setLiveFlash] = useState(false)

  const { token } = useAuth()
  const { data: rawOverview } = useApi(() => getAppOverview(appId), [appId])
  const overview = rawOverview ? mapAppOverview(rawOverview) : null

  const { connected, appHealthMap } = useHealthSocket({ token })

  useEffect(() => {
    const appData = appHealthMap[appId]
    if (!appData) return
    setLiveHealthScore(appData.health_score)
    setLiveLatency(appData.latency_p99)
    setLiveUptime(appData.uptime)
    setLiveRpm(appData.rpm)
    setLiveFlash(true)
    const t = setTimeout(() => setLiveFlash(false), 800)
    return () => clearTimeout(t)
  }, [appHealthMap, appId])

  async function handleCheckHealth() {
    setRunningCheck(true)
    try {
      const result = await runHealthCheck(appId)
      setCheckResult(result)
    } finally {
      setRunningCheck(false)
    }
  }

  const app = overview?.app
  const healthScore = liveHealthScore ?? app?.healthScore ?? 94
  const healthHistory = overview?.healthHistory ?? HEALTH_SCORE_7D
  const latency24h = overview?.latency24h ?? []
  const errorRate24h = overview?.errorRate24h ?? []

  const avgErrorRate = errorRate24h.length > 0
    ? (errorRate24h.reduce((s, d) => s + d.rate, 0) / errorRate24h.length)
    : null

  const displayLatency = liveLatency ?? app?.latencyP99 ?? 42
  const displayUptime = liveUptime ?? app?.uptime ?? 99.98
  const displayRpm = liveRpm ?? app?.rpm ?? 12400

  const keyMetrics = [
    { label: "Uptime (30d)", value: `${displayUptime.toFixed(2)}%`, icon: <ShieldCheck className="w-4 h-4" />, color: "text-emerald-500", trend: +0.01, live: liveUptime !== null },
    { label: "P99 Latency", value: `${Math.round(displayLatency)}ms`, icon: <Zap className="w-4 h-4" />, color: "text-emerald-500", trend: -8, live: liveLatency !== null },
    { label: "Error Rate", value: avgErrorRate !== null ? `${(avgErrorRate * 100).toFixed(2)}%` : "0.04%", icon: <AlertTriangle className="w-4 h-4" />, color: avgErrorRate !== null && avgErrorRate * 100 > 1 ? "text-red-500" : "text-emerald-500", trend: -0.02, live: false },
    { label: "Throughput", value: `${(displayRpm / 1000).toFixed(1)}K rpm`, icon: <Activity className="w-4 h-4" />, color: "text-blue-500", trend: +11, live: liveRpm !== null },
  ]

  const latencyScore = Math.min(100, Math.round(100 - (displayLatency / 500) * 100))
  const errorScore = avgErrorRate !== null ? Math.max(0, Math.round(100 - avgErrorRate * 100 * 10)) : 99
  const infraScore = 88
  const availabilityScore = Math.round(displayUptime)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant={connected ? "healthy" : "outline"}
            size="sm"
            className={cn(
              "transition-all duration-300",
              liveFlash && connected && "ring-2 ring-emerald-500/40"
            )}
          >
            <Radio className={cn("w-3 h-3 mr-1", connected ? "text-emerald-500" : "text-muted-foreground")} />
            {connected ? "Live" : "Polling"}
          </Badge>
          {connected && liveHealthScore !== null && (
            <span className="text-[10px] text-muted-foreground">
              Socket active · updates every 30s
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          onClick={handleCheckHealth}
          disabled={runningCheck}
        >
          <RefreshCw className={cn("w-3.5 h-3.5", runningCheck && "animate-spin")} />
          {runningCheck ? "Checking Health..." : "Check Health Now"}
        </Button>
      </div>

      <AnimatePresence>
        {checkResult && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="premium-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {checkResult.overall_status === "healthy"
                  ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                  : checkResult.overall_status === "warning"
                  ? <AlertTriangle className="w-4 h-4 text-amber-500" />
                  : <XCircle className="w-4 h-4 text-red-500" />
                }
                <span className="text-sm font-semibold text-foreground">Live Health Check</span>
                <span className="text-xs text-muted-foreground">{new Date(checkResult.checked_at).toLocaleTimeString()}</span>
              </div>
              {checkResult.composite_health_score !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Composite Score</span>
                  <span className={cn("text-xl font-bold",
                    checkResult.composite_health_score >= 85 ? "text-emerald-500" :
                    checkResult.composite_health_score >= 65 ? "text-amber-500" : "text-red-500"
                  )}>{checkResult.composite_health_score}</span>
                </div>
              )}
            </div>
            {checkResult.message ? (
              <p className="text-sm text-muted-foreground">{checkResult.message}</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {checkResult.connector_results.map((r) => (
                  <div key={r.connector_instance_id} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-foreground truncate">{r.connector_name}</span>
                      <span className={cn("text-sm font-bold shrink-0 ml-1",
                        r.health_score >= 85 ? "text-emerald-500" : r.health_score >= 65 ? "text-amber-500" : "text-red-500"
                      )}>{r.health_score}</span>
                    </div>
                    <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden mb-1.5">
                      <motion.div
                        className={cn("h-full rounded-full",
                          r.health_score >= 85 ? "bg-emerald-500" : r.health_score >= 65 ? "bg-amber-500" : "bg-red-500"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${r.health_score}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                    <div className="space-y-0.5">
                      {Object.entries(r.metrics).slice(0, 2).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground font-mono truncate">{k.replace(/_/g, " ")}</span>
                          <span className="font-mono text-foreground ml-1 shrink-0">{typeof v === "number" ? v.toLocaleString() : String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={cn(
          "premium-card p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300",
          liveHealthScore !== null && liveFlash && "ring-1 ring-emerald-500/30"
        )}>
          <div className="flex items-center justify-between w-full">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Health Score</div>
            {liveHealthScore !== null && connected && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <HealthRing score={healthScore} />
          <div className="w-full space-y-2 mt-1">
            {[
              { label: "Latency", pct: latencyScore },
              { label: "Errors", pct: errorScore },
              { label: "Infra", pct: infraScore },
              { label: "Availability", pct: availabilityScore },
            ].map(d => (
              <div key={d.label} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-20 shrink-0">{d.label}</span>
                <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", d.pct >= 90 ? "bg-emerald-500" : d.pct >= 70 ? "bg-amber-500" : "bg-red-500")}
                    initial={{ width: 0 }}
                    animate={{ width: `${d.pct}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[10px] font-mono font-semibold text-foreground w-7 text-right">{d.pct}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 premium-card p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Health Score — 7 Days</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={healthHistory} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="scoreGrad360" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.35} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={6} />
              <YAxis domain={[75, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip {...CHART_STYLE} />
              <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fill="url(#scoreGrad360)" name="Health Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {keyMetrics.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={cn(
              "premium-card p-4 transition-all duration-300",
              m.live && liveFlash && "ring-1 ring-emerald-500/30"
            )}>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center", m.color)}>{m.icon}</span>
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">{m.label}</span>
                {m.live && connected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                )}
              </div>
            </div>
            <div className="text-xl font-bold text-foreground">{m.value}</div>
            <div className={cn("flex items-center gap-1 text-xs font-semibold mt-1", m.trend > 0 ? "text-emerald-500" : "text-emerald-500")}>
              {m.trend > 0
                ? <TrendingUp className="w-3 h-3" />
                : <TrendingDown className="w-3 h-3" />
              }
              {Math.abs(m.trend)}% vs last week
            </div>
          </motion.div>
        ))}
      </div>

      <div className="premium-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border/60">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Health Rules — Summary</div>
        </div>
        <div className="divide-y divide-border/40">
          {HEALTH_RULES.map((r, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3">
              <div className={cn("w-2 h-2 rounded-full shrink-0",
                r.status === "pass" ? "bg-emerald-500" : r.status === "warn" ? "bg-amber-500" : "bg-red-500"
              )} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{r.name}</div>
                <div className="text-xs font-mono text-muted-foreground">{r.condition}</div>
              </div>
              <div className="text-xs font-mono font-semibold text-foreground">{r.current}</div>
              <div className="w-16 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", r.status === "pass" ? "bg-emerald-500" : "bg-amber-500")}
                  style={{ width: `${r.weight * 3.3}%` }} />
              </div>
              <div className="text-[10px] text-muted-foreground w-12 text-right">w:{r.weight}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
