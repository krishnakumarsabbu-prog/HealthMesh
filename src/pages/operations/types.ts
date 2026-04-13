export type OpTab = "overview" | "connectors" | "incidents" | "dependencies"

export interface OpMetricCard {
  label: string
  value: string | number
  delta?: string
  deltaPositive?: boolean
  sub?: string
}
