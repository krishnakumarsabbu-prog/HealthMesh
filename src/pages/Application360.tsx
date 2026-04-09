import { motion } from "framer-motion"
import { useState } from "react"
import { Server, GitBranch, ExternalLink } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { APP_OPTIONS } from "./application360/data"
import { TabOverview } from "./application360/TabOverview"
import { TabSignals } from "./application360/TabSignals"
import { TabTransactions } from "./application360/TabTransactions"
import { TabLogs } from "./application360/TabLogs"
import { TabInfra } from "./application360/TabInfra"
import { TabAPIs } from "./application360/TabAPIs"
import { TabDependencies } from "./application360/TabDependencies"
import { TabIncidents } from "./application360/TabIncidents"
import { TabHealthRules } from "./application360/TabHealthRules"
import { TabAISummary } from "./application360/TabAISummary"
import { TabConfiguration } from "./application360/TabConfiguration"

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "signals", label: "Signals" },
  { value: "transactions", label: "Transactions" },
  { value: "logs", label: "Logs" },
  { value: "infra", label: "Infra" },
  { value: "apis", label: "APIs" },
  { value: "dependencies", label: "Dependencies" },
  { value: "incidents", label: "Incidents" },
  { value: "health-rules", label: "Health Rules" },
  { value: "ai-summary", label: "AI Summary" },
  { value: "configuration", label: "Configuration" },
]

export function Application360() {
  const [selectedApp, setSelectedApp] = useState("payments-api")
  const app = APP_OPTIONS.find(a => a.value === selectedApp) ?? APP_OPTIONS[0]

  return (
    <div className="min-h-full">
      <PageHeader
        title="Application 360°"
        description="Deep-dive health intelligence for a single application"
        badge={<StatusBadge status={app.status} size="sm" />}
        actions={
          <Select value={selectedApp} onValueChange={setSelectedApp}>
            <SelectTrigger className="w-52 h-8 text-sm font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APP_OPTIONS.map(a => (
                <SelectItem key={a.value} value={a.value} className="font-mono text-sm">
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="px-6 pb-6 space-y-5">
        {/* App hero card */}
        <motion.div key={selectedApp} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="premium-card p-5">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1.5">
                <h2 className="text-lg font-bold font-mono text-foreground">{app.label}</h2>
                <StatusBadge status={app.status} />
                <Badge variant="secondary" size="sm">Production</Badge>
                <Badge variant="outline" size="sm">{app.type}</Badge>
                <Badge variant="outline" size="sm" className={cn(
                  "font-mono",
                  app.criticality === "P0" ? "border-red-500/40 text-red-500" :
                  app.criticality === "P1" ? "border-amber-500/40 text-amber-500" : ""
                )}>{app.criticality}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {app.team} Team · {app.lang} · {app.version} · {app.runtime}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-center px-4 py-2 rounded-xl bg-muted/40 border border-border/60">
                <div className={cn("text-xl font-bold",
                  app.score >= 90 ? "text-emerald-500" : app.score >= 70 ? "text-amber-500" : "text-red-500"
                )}>{app.score}</div>
                <div className="text-[10px] text-muted-foreground">Health</div>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <GitBranch className="w-3.5 h-3.5" /> Traces
              </Button>
              <Button size="sm" className="gap-2 text-xs">
                <ExternalLink className="w-3.5 h-3.5" /> Logs
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 11-tab panel */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Tabs defaultValue="overview">
            <div className="overflow-x-auto">
              <TabsList className="flex w-max gap-0 h-auto p-1 mb-4">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} className="text-xs px-3 py-1.5 whitespace-nowrap">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="overview"><TabOverview /></TabsContent>
            <TabsContent value="signals"><TabSignals /></TabsContent>
            <TabsContent value="transactions"><TabTransactions /></TabsContent>
            <TabsContent value="logs"><TabLogs /></TabsContent>
            <TabsContent value="infra"><TabInfra /></TabsContent>
            <TabsContent value="apis"><TabAPIs /></TabsContent>
            <TabsContent value="dependencies"><TabDependencies /></TabsContent>
            <TabsContent value="incidents"><TabIncidents /></TabsContent>
            <TabsContent value="health-rules"><TabHealthRules /></TabsContent>
            <TabsContent value="ai-summary"><TabAISummary /></TabsContent>
            <TabsContent value="configuration"><TabConfiguration /></TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
