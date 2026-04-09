export interface TrendDataPointModel {
  label: string
  healthScore: number
  availability: number
  incidents: number
  latency: number
  errorRate: number
  mttr: number
  mttd: number
}

export interface SourceTrendModel {
  name: string
  score: number
  trend: number
  incidents: number
  status: string
}

export interface TeamTrendModel {
  name: string
  score: number
  trend: number
  apps: number
  incidents: number
}

export interface EnvTrendModel {
  env: string
  score: number
  incidents: number
  availability: number
  latency: number
}

export interface TrendSummaryModel {
  avgAvailability: number
  totalIncidents: number
  mttrImprovement: number
  avgLatencyDelta: number
  incidentReductionPct: number
  sources: SourceTrendModel[]
  teams: TeamTrendModel[]
  environments: EnvTrendModel[]
}
