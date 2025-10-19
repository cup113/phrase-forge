// 统一的数据类型定义
export interface EvaluationResult {
  level: string
  reason: string
  suggestions?: string[]
  explanation?: string
}

export interface ApiUsage {
  inputTokens: number
  outputTokens: number
  modelId: string
}

export interface Task {
  id: string
  keyword: string
  sentence: string
  scenario: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: EvaluationResult
  usage?: ApiUsage
  error?: string
  createdAt: number
  startedAt?: number
  completedAt?: number
}

// HistoryRecord 复用 Task 结构
export type HistoryRecord = Task & { status: 'completed' }

export interface ApiConfig {
  apiKey: string
  endpoint: string
}
