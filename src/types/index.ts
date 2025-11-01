export interface ApiUsage {
  inputTokens: number
  outputTokens: number
  modelId: string
}

// --evaluation--

export interface SentenceMakingEvaluation {
  level: string
  reason: string
  suggestions?: string[]
  explanation?: string
  usage?: ApiUsage[] | ApiUsage // backward compatibility
}

export interface TranslationComparisonOptionEvaluation {
  text: string
  level: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C'
  reason: string
  example: string
}

export interface TranslationComparisonEvaluation {
  options: TranslationComparisonOptionEvaluation[]
  usage: ApiUsage[] // no compatibility as it's newly added
}

export interface SummaryGradingStandard {
  standard: string
  usage: ApiUsage[]
}

export interface SummaryEvaluation {
  full: number
  total: number
  wordLimitPenalty: number
  contentBasic: number
  contentAdditionRaw: number
  contentAddition: number
  languageBonus: number
  languageReasons: string[]
  contentReasons: string[]
  contentGrades: ('A' | 'B' | 'C' | 'D')[]
  usage: ApiUsage[]
}

// --task--

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
  translations: string[][]
  result?: TranslationComparisonEvaluation
}

export interface SummaryStandardForgingTaskCore {
  type: 'summary-standard'
  passage: string
  result?: SummaryGradingStandard
}

export interface SummaryEvaluationTaskCore {
  type: 'summary-evaluation'
  passage?: string
  summary: string
  standard: string
  result?: SummaryEvaluation
}

export type TaskResult =
  | SentenceMakingEvaluation
  | TranslationComparisonEvaluation
  | SummaryGradingStandard
  | SummaryEvaluation

export type Task = TaskBasics &
  (
    | SentenceMakingTaskCore
    | TranslationComparisonTaskCore
    | SummaryStandardForgingTaskCore
    | SummaryEvaluationTaskCore
  )

// -- type guard --

export function isSentenceMakingTask(task: Task): task is TaskBasics & SentenceMakingTaskCore {
  return task.type === 'sentence-making' || !task.type
}

export function isTranslationComparisonTask(
  task: Task,
): task is TaskBasics & TranslationComparisonTaskCore {
  return task.type === 'translation-comparison'
}

export function isSentenceMakingEvaluation(result: TaskResult): result is SentenceMakingEvaluation {
  return 'level' in result && 'reason' in result
}

export function isTranslationComparisonEvaluation(
  result: TaskResult,
): result is TranslationComparisonEvaluation {
  return 'explanation' in result && 'options' in result
}

export function isSummaryStandardTask(
  task: Task,
): task is TaskBasics & SummaryStandardForgingTaskCore {
  return task.type === 'summary-standard'
}

export function isSummaryEvaluationTask(
  task: Task,
): task is TaskBasics & SummaryEvaluationTaskCore {
  return task.type === 'summary-evaluation'
}

export function isSummaryGradingStandard(result: TaskResult): result is SummaryGradingStandard {
  return 'standard' in result && 'usage' in result
}

export function isSummaryEvaluation(result: TaskResult): result is SummaryEvaluation {
  return 'full' in result && 'total' in result && 'wordLimitPenalty' in result
}

export interface ApiConfig {
  apiKey: string
  endpoint?: string // backward compatibility
  sentenceMakingEndpoint: string
  translationComparisonEndpoint: string
  summaryEndpoint: string
}
