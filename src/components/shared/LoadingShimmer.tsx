import { cn } from "@/lib/utils"

interface LoadingShimmerProps {
  rows?: number
  className?: string
}

export function LoadingShimmer({ rows = 3, className }: LoadingShimmerProps) {
  return (
    <div className={cn("space-y-3 p-6", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div
            className="h-4 rounded-md bg-muted overflow-hidden relative"
            style={{ width: `${Math.random() * 30 + 60}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_1.5s_infinite]" />
          </div>
          <div className="h-3 rounded-md bg-muted/60 overflow-hidden relative w-2/3">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_1.5s_0.2s_infinite]" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CardShimmer({ className }: { className?: string }) {
  return (
    <div className={cn("premium-card p-5 space-y-3", className)}>
      <div className="h-3 w-24 rounded bg-muted overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_1.5s_infinite]" />
      </div>
      <div className="h-8 w-20 rounded bg-muted overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_1.5s_0.1s_infinite]" />
      </div>
      <div className="h-3 w-32 rounded bg-muted/60 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_1.5s_0.2s_infinite]" />
      </div>
    </div>
  )
}
