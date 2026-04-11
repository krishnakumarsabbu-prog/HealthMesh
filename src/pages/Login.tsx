import { useState, FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Eye, EyeOff, LogIn, Activity } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

const DEMO_ACCOUNTS = [
  { label: "LOB Admin", email: "lob_admin@dti.com", password: "Admin@123" },
  { label: "Team Admin", email: "team_admin@dti.com", password: "Admin@123" },
  { label: "Project Admin", email: "project_admin@dti.com", password: "Admin@123" },
  { label: "Viewer", email: "user1@dti.com", password: "User@123" },
]

export function Login() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(email, password)
      navigate("/", { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed")
    }
  }

  const fillDemo = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email)
    setPassword(account.password)
    setError("")
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[hsl(var(--sidebar-bg))] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-primary" />
          <div className="absolute top-40 left-40 w-48 h-48 rounded-full border border-primary" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full border border-primary" />
          <div className="absolute bottom-40 right-40 w-56 h-56 rounded-full border border-primary" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-sm"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">HealthMesh</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">
            Enterprise Application Health Intelligence
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Monitor, analyze, and optimize your entire application portfolio with AI-powered insights and real-time health scoring.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[
              { label: "Applications Monitored", value: "240+" },
              { label: "Health Score Avg", value: "94.2" },
              { label: "Incidents Resolved", value: "1.2K" },
              { label: "Uptime Maintained", value: "99.9%" },
            ].map((stat) => (
              <div key={stat.label} className="bg-background/40 rounded-xl p-4 border border-border/40">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">HealthMesh</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
          <p className="text-muted-foreground text-sm mb-8">Sign in to access your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className={cn(
                  "w-full h-10 px-3 rounded-lg border bg-background text-foreground text-sm outline-none transition-all",
                  "placeholder:text-muted-foreground/60",
                  "focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                  "border-border/80 hover:border-border"
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className={cn(
                    "w-full h-10 px-3 pr-10 rounded-lg border bg-background text-foreground text-sm outline-none transition-all",
                    "placeholder:text-muted-foreground/60",
                    "focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                    "border-border/80 hover:border-border"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-lg px-3 py-2"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium",
                "flex items-center justify-center gap-2 transition-all",
                "hover:opacity-90 active:scale-[0.98]",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account)}
                  className={cn(
                    "text-left p-3 rounded-lg border border-border/60 hover:border-primary/40",
                    "hover:bg-muted/50 transition-all cursor-pointer"
                  )}
                >
                  <div className="text-xs font-semibold text-foreground">{account.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{account.email}</div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
