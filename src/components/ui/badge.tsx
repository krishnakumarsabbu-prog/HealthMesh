import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border border-primary/20",
        secondary: "bg-secondary text-secondary-foreground border border-border/60",
        destructive: "bg-red-500/10 text-red-500 border border-red-500/20",
        outline: "border border-border text-foreground",
        healthy: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400",
        warning: "bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400",
        critical: "bg-red-500/10 text-red-600 border border-red-500/20 dark:text-red-400",
        degraded: "bg-orange-500/10 text-orange-600 border border-orange-500/20 dark:text-orange-400",
        unknown: "bg-slate-500/10 text-slate-600 border border-slate-500/20 dark:text-slate-400",
        info: "bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400",
      },
      size: {
        default: "px-2.5 py-0.5",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
