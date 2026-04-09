import { motion } from "framer-motion"
import { useState } from "react"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Server, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, GitBranch, Clock, Activity, ArrowUpRight, Zap, Database, Shield } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { MetricCard } from "@/components/shared/MetricCard"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const LATENCY_DATA = Array.from({ length: 48 }, (_, i) => ({
  time: `${Math.floor(i / 2)}:${i % 2 === 0 ? "00" : "30"}`,
  p50: 35 + Math.sin(i * 0.3) * 10 + Math.random() * 8,
  p95: 65 + Math.sin(i * 0.3) * 20 + Math.random() * 15,
  p99: 95 + Math.sin(i * 0.3) * 30 + Math.random() * 25,
}))

const ERROR_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  rate: Math.max(0, 0.5 + Math.cos(i * 0.5) * 0.3 + Math.random() * 0.4),
}))

const RECENT_EVENTS = [
  { time: "14:32", type: "incident", desc: "P95 latency exceeded 200ms threshold" },
  { time: "13:58", type: "deploy", desc: "v2.14.1 deployed by @sarah.chen" },
  { time: "11:22", type: "alert", desc: "Memory utilization spike — auto-scaled" },
  { time: "09:15", type: "recover", desc: "Connection pool recovered after 3min" },
  { time: "08:00", type: "info", desc: "Scheduled maintenance window started" },
]

export function Application360() {
  const [selectedApp, setSelectedApp] = useState("payments-api")

  return (
    <div className="min-h-full">
      <PageHeader
        title="Application 360°"
        description="Deep-dive health intelligence for a single application"
        badge={<StatusBadge status="healthy" size="sm" />}
        actions={
          <Select value={selectedApp} onValueChange={setSelectedApp}>
            <SelectTrigger className="w-52 h-8 text-sm font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payments-api">payments-api</SelectItem>
              <SelectItem value="auth-service">auth-service</SelectItem>
              <SelectItem value="catalog-service">catalog-service</SelectItem>
              <SelectItem value="search-api">search-api</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="px-6 pb-6 space-y-5">
        {/* App identity card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-5">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h2 className="text-lg font-bold font-mono text-foreground">{selectedApp}</h2>
                <StatusBadge status="healthy" />
                <Badge variant="secondary" size="sm">Production</Badge>
                <Badge variant="outline" size="sm">API</Badge>
              </div>
              <div className="text-sm text-muted-foreground">Payments Team · Node.js 20 · v2.14.1 · Kubernetes</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <GitBranch className="w-3.5 h-3.5" /> View traces
              </Button>
              <Button size="sm" className="gap-2 text-xs">
                <ArrowUpRight className="w-3.5 h-3.5" /> View logs
              </Button>
            </div>
          </div>
        </motion.div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Uptime (30d)", value: "99.98", unit: "%", status: "healthy" as const, icon: <Shield className="w-4 h-4" /> },
            { label: "P99 Latency", value: "42", unit: "ms", trend: -12, trendLabel: "vs last week", status: "healthy" as const, icon: <Zap className="w-4 h-4" /> },
            { label: "Error Rate", value: "0.04", unit: "%", trend: -0.8, trendLabel: "vs yesterday", status: "healthy" as const, icon: <AlertTriangle className="w-4 h-4" /> },
            { label: "Throughput", value: "12.4K", unit: "rpm", trend: 8.2, trendLabel: "vs last hour", status: "neutral" as const, icon: <Activity className="w-4 h-4" /> },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <MetricCard {...m} />
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Tabs defaultValue="performance">
            <TabsList>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>

            <TabsContent value="performance">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="premium-card p-5">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Latency Percentiles — 24h</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={LATENCY_DATA} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={11} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                      <Line type="monotone" dataKey="p50" stroke="#10b981" strokeWidth={2} dot={false} name="P50" />
                      <Line type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={2} dot={false} name="P95" />
                      <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={2} dot={false} name="P99" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block" /> P50</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500 inline-block" /> P95</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block" /> P99</span>
                  </div>
                </div>

                <div className="premium-card p-5">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Error Rate — 24h</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={ERROR_DATA} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={5} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                      <Area type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} fill="url(#errorGrad)" name="Error %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="events">
              <div className="premium-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border/60">
                  <div className="text-sm font-semibold">Recent Events</div>
                </div>
                <div className="divide-y divide-border/40">
                  {RECENT_EVENTS.map((event, i) => (
                    <div key={i} className="flex items-start gap-4 px-5 py-3.5">
                      <span className="text-xs font-mono text-muted-foreground shrink-0 mt-0.5">{event.time}</span>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        event.type === "incident" ? "bg-red-500" :
                        event.type === "alert" ? "bg-amber-500" :
                        event.type === "deploy" ? "bg-blue-500" :
                        event.type === "recover" ? "bg-emerald-500" : "bg-slate-400"
                      }`} />
                      <div className="text-sm text-foreground">{event.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="errors">
              <div className="premium-card p-8 text-center text-muted-foreground text-sm">
                Error breakdown, stack traces, and error grouping will appear here.
              </div>
            </TabsContent>

            <TabsContent value="dependencies">
              <div className="premium-card p-8 text-center text-muted-foreground text-sm">
                Upstream and downstream dependency health will appear here.
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
