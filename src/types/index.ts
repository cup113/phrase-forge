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
  standard: string
  total: number
  wordLimitPenalty: number
  contentBasic: number
  contentAdditionRaw: number
  contentAddition: number
  languageBonus: number
  languageReasons: string[]
  contentReasons: string[]
  contentGrades: string[]
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
  result?: SummaryStandardForgingTaskCore
}

export interface SummaryEvaluationTaskCore {
  type: 'summary-evaluation'
  summary: string
  standard: string
  result?: SummaryEvaluationTaskCore
}

export type TaskResult = SentenceMakingEvaluation | TranslationComparisonEvaluation

export type Task = TaskBasics & (SentenceMakingTaskCore | TranslationComparisonTaskCore)

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

export interface ApiConfig {
  apiKey: string
  endpoint?: string // backward compatibility
  sentenceMakingEndpoint: string
  translationComparisonEndpoint: string
}
