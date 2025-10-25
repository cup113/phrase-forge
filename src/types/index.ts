export interface ApiUsage {
  inputTokens: number
  outputTokens: number
  modelId: string
}

export interface SentenceMakingEvaluation {
  level: string
  reason: string
  suggestions?: string[]
  explanation?: string
  usage?: ApiUsage[]
}

export interface TranslationComprisonOptionEvaluation {
  text: string
  level: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C'
  reason: string
  example: string
}

export interface TranslationComparisonEvaluation {
  explanation: string
  options: TranslationComprisonOptionEvaluation[]
}

export interface TaskBasics {
  id: string
  status: 'incomplete' | 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
  createdAt: number
  startedAt?: number
  completedAt?: number
}

export interface SentenceMakingTaskCore {
  type?: 'sentence-making'
  keyword: string
  sentence: string
  scenario: string
  result?: SentenceMakingEvaluation
}

export interface TranslationComparisonTaskCore {
  type: 'translation-comparison'
  original: string
  translation: (string[] | string)[]
}

export type Task = TaskBasics & SentenceMakingTaskCore

export type HistoryRecord = Task & { status: 'completed' }

export interface ApiConfig {
  apiKey: string
  endpoint: string
}
