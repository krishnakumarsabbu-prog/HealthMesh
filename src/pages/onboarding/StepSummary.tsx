import { CircleCheck as CheckCircle, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ONBOARDING_STEPS } from "./data"

interface Props {
  currentStep: number
  appName: string
  team: string
  environment: string
  selectedConnectors: string[]
  selectedMetrics: string[]
}

export function StepSummary({ currentStep, appName, team, environment, selectedConnectors, selectedMetrics }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        {ONBOARDING_STEPS.map((s, i) => (
          <div key={s.id} className={cn(
            "flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors",
            i === currentStep ? "bg-primary/8 border border-primary/20" : "hover:bg-muted/30"
          )}>
            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border text-[10px] font-bold",
              i < currentStep ? "bg-primary border-primary text-primary-foreground" :
              i === currentStep ? "border-primary text-primary" :
              "border-border/60 text-muted-foreground"
            )}>
              {i < currentStep ? <CheckCircle className="w-3 h-3" /> : i + 1}
            </div>
            <div>
              <div className={cn("text-xs font-semibold",
                i === currentStep ? "text-primary" :
                i < currentStep ? "text-foreground" : "text-muted-foreground"
              )}>{s.label}</div>
              <div className="text-[10px] text-muted-foreground">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {(appName || team || environment !== "Production") && (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Configuration Preview</div>
          {appName && <div className="text-xs"><span className="text-muted-foreground">App:</span> <span className="font-mono font-semibold text-foreground">{appName}</span></div>}
          {team && <div className="text-xs"><span className="text-muted-foreground">Team:</span> <span className="font-semibold text-foreground">{team}</span></div>}
          <div className="text-xs"><span className="text-muted-foreground">Env:</span> <span className="font-semibold text-foreground">{environment}</span></div>
          {selectedConnectors.length > 0 && (
            <div className="text-xs"><span className="text-muted-foreground">Connectors:</span> <span className="font-semibold text-foreground">{selectedConnectors.length}</span></div>
          )}
          {selectedMetrics.length > 0 && (
            <div className="text-xs"><span className="text-muted-foreground">Signals:</span> <span className="font-semibold text-foreground">{selectedMetrics.length}</span></div>
          )}
        </div>
      )}
    </div>
  )
}
