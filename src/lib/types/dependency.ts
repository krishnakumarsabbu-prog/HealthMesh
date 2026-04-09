import type { HealthStatus, NodeType } from "./enums"

export interface DependencyNodeModel {
  id: string
  label: string
  nodeType: NodeType
  status: HealthStatus
  latency: number
  errorRate: number
  rps: number
  uptime: number
  version: string
  team: string
  x: number
  y: number
}

export interface DependencyEdgeModel {
  id: string
  sourceId: string
  targetId: string
  status: HealthStatus
  latency: number
  label: string
}

export interface DependencyMapModel {
  nodes: DependencyNodeModel[]
  edges: DependencyEdgeModel[]
  stats: {
    totalServices: number
    totalConnections: number
    degradedPaths: number
    criticalNodes: number
  }
}
