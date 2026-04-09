import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Calendar, Download, ChartBar as BarChart3 } from "lucide-react"
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const MONTHLY_DATA = [
  { month: "Oct", availability: 99.91, incidents: 8, latency: 98 },
  { month: "Nov", availability: 99.94, incidents: 6, latency: 92 },
  { month: "Dec", availability: 99.88, incidents: 11, latency: 105 },
  { month: "Jan", availability: 99.96, incidents: 4, latency: 88 },
  { month: "Feb", availability: 99.97, incidents: 3, latency: 84 },
  { month: "Mar", availability: 99.95, incidents: 5, latency: 91 },
  { month: "Apr", availability: 99.98, incidents: 2, latency: 79 },
]

const WEEKLY_DATA = Array.from({ length: 28 }, (_, i) => ({
  day: `D${i + 1}`,
  score: 88 + Math.sin(i * 0.3) * 6 + Math.random() * 3,
  latency: 80 + Math.sin(i * 0.4) * 20 + Math.random() * 10,
  errors: Math.max(0, 0.8 + Math.cos(i * 0.5) * 0.4 + Math.random() * 0.3),
}))

const CHART_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  }
}

export function HistoricalTrends() {
  return (
    <div className="min-h-full">
      <PageHeader
        title="Historical Trends"
        description="Long-term performance analysis, SLO tracking, and health trajectory insights"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-3.5 h-3.5" /> Last 90 days
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
          </div>
        }
      />

      <div className="px-6 pb-6 space-y-5">
        {/* Trend summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Avg Availability (90d)", value: "99.94%", trend: +0.03, status: "healthy" },
            { label: "Total Incidents (90d)", value: "39", trend: -34, status: "healthy" },
            { label: "MTTR Improvement", value: "28%", trend: +28, status: "healthy" },
            { label: "Avg Latency Trend", value: "−11ms", trend: -12.4, status: "healthy" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="premium-card p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{s.label}</div>
              <div className="text-xl font-bold text-foreground mb-1">{s.value}</div>
              <div className={cn("flex items-center gap-1 text-xs font-semibold",
                s.trend > 0 ? "text-emerald-500" : "text-red-500"
              )}>
                {s.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(s.trend)}% vs prev period
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <Tabs defaultValue="availability">
          <TabsList>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="latency">Latency</TabsTrigger>
            <TabsTrigger value="health">Health Score</TabsTrigger>
          </TabsList>

          <TabsContent value="availability">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 premium-card p-5">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">System Availability — Monthly</div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={MONTHLY_DATA} margin={{ top: 4, right: 0, bottom: 0, left: -10 }}>
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
                    <Area type="monotone" dataKey="availability" stroke="#10b981" strokeWidth={2.5} fill="url(#availGrad)" name="Availability %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="premium-card p-5">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Monthly Incidents</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={MONTHLY_DATA} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip {...CHART_STYLE} />
                    <Bar dataKey="incidents" fill="hsl(var(--primary))" opacity={0.8} radius={[3, 3, 0, 0]} name="Incidents" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="latency">
            <div className="premium-card p-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Average Latency Trend — 28 days</div>
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
          </TabsContent>

          <TabsContent value="health">
            <div className="premium-card p-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Overall Health Score — 28 days</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={WEEKLY_DATA} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
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
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#scoreGrad)" name="Health Score" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="incidents">
            <div className="premium-card p-8 text-center text-muted-foreground text-sm">
              Incident heatmap and frequency analysis will appear here.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
