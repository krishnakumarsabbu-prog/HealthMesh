import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Calendar, Download, ChevronDown, ChartBar as BarChart2, Activity, Clock, ArrowUpRight, ArrowDownRight, Users, Layers, Globe } from "lucide-react"
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend, ReferenceLine } from "recharts"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import { getTrends, getWeeklyTrends, getTrendSummary, type TrendDataPoint, type SourceTrend, type TeamTrend, type EnvTrend } from "@/lib/api/misc"

function apiMonthly(d: TrendDataPoint) {
  return { month: d.label, availability: d.availability, incidents: d.incidents, latency: d.latency, errorRate: d.error_rate, healthScore: d.health_score, mttr: d.mttr, mttd: d.mttd }
}
function apiWeekly(d: TrendDataPoint) {
  return { day: d.label, score: d.health_score, latency: d.latency, errors: d.error_rate, incidents: d.incidents, uptime: d.availability }
}

const STATIC_MONTHLY_DATA = [
  { month: "Oct", availability: 99.91, incidents: 8, latency: 98, errorRate: 0.42, healthScore: 87, mttr: 38, mttd: 14 },
  { month: "Nov", availability: 99.94, incidents: 6, latency: 92, errorRate: 0.31, healthScore: 89, mttr: 32, mttd: 11 },
  { month: "Dec", availability: 99.88, incidents: 11, latency: 105, errorRate: 0.58, healthScore: 84, mttr: 45, mttd: 18 },
  { month: "Jan", availability: 99.96, incidents: 4, latency: 88, errorRate: 0.24, healthScore: 92, mttr: 28, mttd: 9 },
  { month: "Feb", availability: 99.97, incidents: 3, latency: 84, errorRate: 0.19, healthScore: 94, mttr: 22, mttd: 7 },
  { month: "Mar", availability: 99.95, incidents: 5, latency: 91, errorRate: 0.27, healthScore: 91, mttr: 26, mttd: 8 },
  { month: "Apr", availability: 99.98, incidents: 2, latency: 79, errorRate: 0.14, healthScore: 96, mttr: 18, mttd: 6 },
]

const STATIC_WEEKLY_DATA = Array.from({ length: 28 }, (_, i) => ({
  day: `D${i + 1}`,
  score: parseFloat((88 + Math.sin(i * 0.3) * 6 + Math.random() * 3).toFixed(1)),
  latency: parseFloat((80 + Math.sin(i * 0.4) * 20 + Math.random() * 10).toFixed(1)),
  errors: parseFloat(Math.max(0, 0.8 + Math.cos(i * 0.5) * 0.4 + Math.random() * 0.3).toFixed(2)),
  incidents: Math.floor(Math.random() * 3),
  uptime: parseFloat((99.9 + Math.random() * 0.09).toFixed(3)),
}))


const FALLBACK_SOURCE_TRENDS: SourceTrend[] = [
  { name: "Datadog APM", score: 94, trend: +3.2, incidents: 2, status: "healthy" },
  { name: "Prometheus", score: 91, trend: +1.8, incidents: 4, status: "healthy" },
  { name: "CloudWatch", score: 88, trend: -0.4, incidents: 3, status: "warning" },
  { name: "Splunk Logs", score: 85, trend: +2.1, incidents: 5, status: "warning" },
  { name: "AppDynamics", score: 96, trend: +4.0, incidents: 1, status: "healthy" },
]

const FALLBACK_TEAM_TRENDS: TeamTrend[] = [
  { name: "Platform Eng", score: 96, trend: +2.1, apps: 18, incidents: 3 },
  { name: "Payments", score: 91, trend: +0.8, apps: 12, incidents: 5 },
  { name: "Search & Discovery", score: 72, trend: -3.4, apps: 7, incidents: 11 },
  { name: "Identity & Auth", score: 88, trend: +1.2, apps: 9, incidents: 4 },
  { name: "Data Pipeline", score: 83, trend: -0.6, apps: 14, incidents: 7 },
]

const FALLBACK_ENV_TRENDS: EnvTrend[] = [
  { env: "production", score: 91, incidents: 5, availability: 99.97, latency: 82 },
  { env: "staging", score: 84, incidents: 8, availability: 99.88, latency: 96 },
  { env: "development", score: 76, incidents: 14, availability: 99.71, latency: 128 },
]

const DATE_RANGES = ["Last 7d", "Last 30d", "Last 90d", "Last 6m", "Last 1y"]

const CHART_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
    color: "hsl(var(--foreground))",
  }
}

function TrendBadge({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const positive = value > 0
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold", positive ? "text-emerald-500" : "text-red-500")}>
      {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(value)}{suffix}
    </span>
  )
}

function ScoreBar({ score, prev }: { score: number; prev?: number }) {
  const color = score >= 90 ? "bg-emerald-500" : score >= 75 ? "bg-amber-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
      {prev !== undefined && (
        <div className="w-1 bg-muted-foreground/40 rounded-full h-1.5 relative">
          <div className="absolute -left-0.5 w-2 h-0.5 bg-muted-foreground/60 rounded-full" style={{ top: `${100 - prev}%` }} />
        </div>
      )}
      <span className="text-xs font-bold tabular-nums text-foreground w-8 text-right">{score}</span>
    </div>
  )
}

export function HistoricalTrends() {
  const [dateRange, setDateRange] = useState("Last 90d")
  const [compareMode, setCompareMode] = useState(false)
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [drillTarget, setDrillTarget] = useState<string | null>(null)

  const { data: apiMonthlyRaw, loading: monthlyLoading } = useApi(getTrends)
  const { data: apiWeeklyRaw } = useApi(getWeeklyTrends)
  const { data: summaryData } = useApi(getTrendSummary)

  const MONTHLY_DATA = apiMonthlyRaw && apiMonthlyRaw.length > 0
    ? apiMonthlyRaw.map(apiMonthly)
    : STATIC_MONTHLY_DATA
  const WEEKLY_DATA = apiWeeklyRaw && apiWeeklyRaw.length > 0
    ? apiWeeklyRaw.map(apiWeekly)
    : STATIC_WEEKLY_DATA
  const COMPARE_DATA = MONTHLY_DATA.map(d => ({
    ...d,
    prevAvailability: parseFloat(((d.availability || 99.9) - 0.04).toFixed(3)),
    prevLatency: (d.latency || 90) + 12,
    prevIncidents: Math.round((d.incidents || 5) * 1.4),
    prevHealthScore: (d.healthScore || 90) - 4,
  }))

  const avgAvailability = MONTHLY_DATA.length > 0
    ? (MONTHLY_DATA.reduce((a, d) => a + (d.availability || 0), 0) / MONTHLY_DATA.length).toFixed(2) + "%"
    : "—"
  const totalIncidents = MONTHLY_DATA.reduce((a, d) => a + (d.incidents || 0), 0)
  const firstHalfInc = MONTHLY_DATA.slice(0, Math.ceil(MONTHLY_DATA.length / 2)).reduce((a, d) => a + (d.incidents || 0), 0)
  const secondHalfInc = MONTHLY_DATA.slice(Math.ceil(MONTHLY_DATA.length / 2)).reduce((a, d) => a + (d.incidents || 0), 0)
  const incidentReduction = firstHalfInc > 0 ? -Math.round(((firstHalfInc - secondHalfInc) / firstHalfInc) * 100) : 0
  const firstLatency = MONTHLY_DATA.length > 0 ? (MONTHLY_DATA[0]?.latency || 90) : 90
  const lastLatency = MONTHLY_DATA.length > 0 ? (MONTHLY_DATA[MONTHLY_DATA.length - 1]?.latency || 90) : 90
  const latencyDelta = lastLatency - firstLatency

  const sourceTrends: SourceTrend[] = (summaryData?.sources && summaryData.sources.length > 0)
    ? summaryData.sources
    : FALLBACK_SOURCE_TRENDS
  const teamTrends: TeamTrend[] = (summaryData?.teams && summaryData.teams.length > 0)
    ? summaryData.teams
    : FALLBACK_TEAM_TRENDS
  const envTrends: EnvTrend[] = (summaryData?.environments && summaryData.environments.length > 0)
    ? summaryData.environments
    : FALLBACK_ENV_TRENDS

  return (
    <div className="min-h-full">
      <PageHeader
        title="Historical Trends"
        description="Long-term performance analysis, SLO tracking, and health trajectory insights across all dimensions"
        actions={
          <div className="flex gap-2">
            <Button
              variant={compareMode ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => setCompareMode(c => !c)}
            >
              <BarChart2 className="w-3.5 h-3.5" /> Compare
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowDateDropdown(v => !v)}
              >
                <Calendar className="w-3.5 h-3.5" />
                {dateRange}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </Button>
              <AnimatePresence>
                {showDateDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    className="absolute right-0 top-full mt-1.5 w-36 premium-card py-1.5 z-20 shadow-elevation-3"
                  >
                    {DATE_RANGES.map(r => (
                      <button
                        key={r}
                        className={cn("w-full px-3 py-2 text-xs text-left hover:bg-muted transition-colors rounded-md mx-auto",
                          r === dateRange ? "text-primary font-bold bg-primary/5" : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => { setDateRange(r); setShowDateDropdown(false) }}
                      >
                        {r}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
          </div>
        }
      />

      <div className="px-6 pb-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Avg Availability", value: avgAvailability, trend: +0.03, icon: Activity, positive: true },
            { label: "Total Incidents", value: String(totalIncidents), trend: incidentReduction, icon: Clock, suffix: "%", positive: incidentReduction <= 0 },
            { label: "MTTR Improvement", value: "18%", trend: +18, icon: TrendingUp, positive: true },
            { label: "Avg Latency Trend", value: `${latencyDelta > 0 ? "+" : ""}${latencyDelta}ms`, trend: latencyDelta, icon: BarChart2, positive: latencyDelta <= 0 },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="premium-card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="section-label">{s.label}</span>
                <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="text-xl font-bold tabular-nums text-foreground mb-1.5">{s.value}</div>
              <TrendBadge value={s.trend} suffix={s.suffix ?? "%"} />
            </motion.div>
          ))}
        </div>

        {compareMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-4 text-xs premium-card px-4 py-3 overflow-hidden"
          >
            <span className="font-bold text-foreground">Compare mode</span>
            <span className="flex items-center gap-1.5 text-primary">
              <span className="w-5 border-t-2 border-primary rounded" /> Current period
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-5 border-t-2 border-muted-foreground border-dashed rounded" /> Previous period
            </span>
            <button className="ml-auto text-muted-foreground hover:text-foreground text-xs transition-colors" onClick={() => setCompareMode(false)}>
              Dismiss
            </button>
          </motion.div>
        )}

        <Tabs defaultValue="health">
          <TabsList>
            <TabsTrigger value="health">Health Score</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="latency">Latency</TabsTrigger>
            <TabsTrigger value="errors">Error Rate</TabsTrigger>
            <TabsTrigger value="mttr">MTTR / MTTD</TabsTrigger>
          </TabsList>

          <TabsContent value="health">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 premium-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="section-label mb-0.5">Overall Health Score</div>
                    <div className="text-xs text-muted-foreground">28-day rolling window</div>
                  </div>
                  {drillTarget ? (
                    <button className="text-xs text-primary hover:underline font-semibold" onClick={() => setDrillTarget(null)}>
                      Clear drill-down
                    </button>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/60">Click a point to drill down</span>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={WEEKLY_DATA} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}
                    onClick={d => d?.activeLabel && setDrillTarget(d.activeLabel)}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={6} />
                    <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip {...CHART_STYLE} />
                    {drillTarget && <ReferenceLine x={drillTarget} stroke="hsl(var(--primary))" strokeDasharray="4 2" strokeWidth={1.5} />}
                    <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#scoreGrad)" name="Health Score" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                {drillTarget && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-3 inset-panel p-3 text-xs">
                    <span className="font-bold text-foreground">{drillTarget}</span>
                    <span className="ml-2 text-muted-foreground">
                      Score: <span className="font-semibold text-foreground">{WEEKLY_DATA.find(d => d.day === drillTarget)?.score}</span>
                      {" · "}Latency: <span className="font-semibold text-foreground">{WEEKLY_DATA.find(d => d.day === drillTarget)?.latency}ms</span>
                      {" · "}Errors: <span className="font-semibold text-foreground">{WEEKLY_DATA.find(d => d.day === drillTarget)?.errors}%</span>
                    </span>
                  </motion.div>
                )}
              </div>
              <div className="premium-card p-5">
                <div className="section-label mb-1">Monthly Score Trend</div>
                <div className="text-xs text-muted-foreground mb-4">Oct — Apr comparison</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={compareMode ? COMPARE_DATA : MONTHLY_DATA} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip {...CHART_STYLE} />
                    <Line type="monotone" dataKey="healthScore" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--primary))" }} name="Health Score" />
                    {compareMode && <Line type="monotone" dataKey="prevHealthScore" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Prev Period" />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="availability">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 premium-card p-5">
                <div className="section-label mb-1">System Availability</div>
                <div className="text-xs text-muted-foreground mb-4">Monthly (%)</div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={compareMode ? COMPARE_DATA : MONTHLY_DATA} margin={{ top: 4, right: 0, bottom: 0, left: -10 }}>
                    <defs>
                      <linearGradient id="availGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis domain={[99.8, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip {...CHART_STYLE} />
                    <Area type="monotone" dataKey="availability" stroke="#10b981" strokeWidth={2.5} fill="url(#availGrad)" name="Availability %" dot={false} />
                    {compareMode && <Line type="monotone" dataKey="prevAvailability" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Prev Period" />}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="premium-card p-5">
                <div className="section-label mb-4">Uptime by Environment</div>
                <div className="space-y-5">
                  {envTrends.map(e => (
                    <div key={e.env}>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="capitalize font-semibold text-foreground">{e.env}</span>
                        <span className={cn("font-mono tabular-nums font-bold",
                          e.availability >= 99.95 ? "text-emerald-500" :
                          e.availability >= 99.8 ? "text-amber-500" : "text-red-500"
                        )}>{e.availability}%</span>
                      </div>
                      <div className="bg-muted rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((e.availability - 99) / 1) * 100}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          className={cn("h-full rounded-full",
                            e.availability >= 99.95 ? "bg-emerald-500" :
                            e.availability >= 99.8 ? "bg-amber-500" : "bg-red-500"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="incidents">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 premium-card p-5">
                <div className="section-label mb-1">Incident Frequency</div>
                <div className="text-xs text-muted-foreground mb-4">Monthly count</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={compareMode ? COMPARE_DATA : MONTHLY_DATA} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip {...CHART_STYLE} />
                    {compareMode && <Legend />}
                    <Bar dataKey="incidents" fill="hsl(var(--primary))" opacity={0.85} radius={[4, 4, 0, 0]} name="Incidents" />
                    {compareMode && <Bar dataKey="prevIncidents" fill="hsl(var(--muted-foreground))" opacity={0.4} radius={[4, 4, 0, 0]} name="Prev Period" />}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="premium-card p-5">
                <div className="section-label mb-1">Daily Incident Count</div>
                <div className="text-xs text-muted-foreground mb-4">Last 14 days</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={WEEKLY_DATA.slice(-14)} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip {...CHART_STYLE} />
                    <Bar dataKey="incidents" fill="#f59e0b" opacity={0.8} radius={[3, 3, 0, 0]} name="Incidents" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="latency">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 premium-card p-5">
                <div className="section-label mb-1">Avg Latency Trend</div>
                <div className="text-xs text-muted-foreground mb-4">28 days (ms)</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={WEEKLY_DATA} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={6} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip {...CHART_STYLE} />
                    <Line type="monotone" dataKey="latency" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Avg Latency (ms)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="premium-card p-5">
                <div className="section-label mb-4">Latency by Environment</div>
                <div className="space-y-5">
                  {envTrends.map(e => (
                    <div key={e.env}>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="capitalize font-semibold text-foreground">{e.env}</span>
                        <span className={cn("font-mono tabular-nums font-bold",
                          e.latency <= 90 ? "text-emerald-500" :
                          e.latency <= 110 ? "text-amber-500" : "text-red-500"
                        )}>{e.latency}ms</span>
                      </div>
                      <div className="bg-muted rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((e.latency / 150) * 100, 100)}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          className={cn("h-full rounded-full",
                            e.latency <= 90 ? "bg-emerald-500" :
                            e.latency <= 110 ? "bg-amber-500" : "bg-red-500"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="errors">
            <div className="premium-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="section-label mb-0.5">Error Rate Trend</div>
                  <div className="text-xs text-muted-foreground">28 days (%)</div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-4 border-t-2 border-amber-500 border-dashed rounded" />
                  <span className="text-muted-foreground">SLO Threshold (1.0%)</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={WEEKLY_DATA} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={6} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <Tooltip {...CHART_STYLE} />
                  <ReferenceLine y={1.0} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "SLO", fontSize: 10, fill: "#f59e0b", position: "right" }} />
                  <Area type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} fill="url(#errGrad)" name="Error Rate (%)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="mttr">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="premium-card p-5">
                <div className="section-label mb-1">Mean Time to Resolve</div>
                <div className="text-xs text-muted-foreground mb-4">Minutes · monthly</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={MONTHLY_DATA} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip {...CHART_STYLE} />
                    <Bar dataKey="mttr" fill="hsl(var(--primary))" opacity={0.85} radius={[4, 4, 0, 0]} name="MTTR (min)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="premium-card p-5">
                <div className="section-label mb-1">Mean Time to Detect</div>
                <div className="text-xs text-muted-foreground mb-4">Minutes · monthly</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={MONTHLY_DATA} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip {...CHART_STYLE} />
                    <Bar dataKey="mttd" fill="#10b981" opacity={0.85} radius={[4, 4, 0, 0]} name="MTTD (min)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="premium-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="section-label">Source-wise Health</span>
            </div>
            <div className="space-y-3.5">
              {sourceTrends.map(s => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-foreground truncate pr-2">{s.name}</span>
                    <TrendBadge value={s.trend} />
                  </div>
                  <ScoreBar score={s.score} />
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="section-label">Team-wise Health</span>
            </div>
            <div className="space-y-3.5">
              {teamTrends.map(t => (
                <div key={t.name}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-foreground truncate pr-2">{t.name}</span>
                    <TrendBadge value={t.trend} />
                  </div>
                  <ScoreBar score={t.score} />
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="section-label">Environment Health</span>
            </div>
            <div className="space-y-3">
              {envTrends.map(e => (
                <motion.div key={e.env} whileHover={{ scale: 1.01 }} transition={{ duration: 0.15 }}
                  className="premium-card-interactive p-3.5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="capitalize font-bold text-sm text-foreground">{e.env}</span>
                    <span className={cn("text-base font-bold tabular-nums",
                      e.score >= 90 ? "text-emerald-500" : e.score >= 75 ? "text-amber-500" : "text-red-500"
                    )}>{e.score}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                    <div className="text-center">
                      <div className="font-bold text-foreground text-xs tabular-nums">{e.incidents}</div>
                      <div>incidents</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-foreground text-xs tabular-nums">{e.availability}%</div>
                      <div>uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-foreground text-xs tabular-nums">{e.latency}ms</div>
                      <div>latency</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
