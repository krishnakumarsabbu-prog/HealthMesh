import type { InsightType, InsightPriority } from "./enums"

export interface AiInsightModel {
  id: string
  appId: string
  appName: string
  type: InsightType
  priority: InsightPriority
  title: string
  description: string
  confidence: number
  impact: string
  recommendation: string
  signals: string[]
  whatChanged: string
  age: string
  generatedAt: string
}
