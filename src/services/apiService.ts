import type { ApiUsage, TranslationComparisonEvaluation } from '@/types'

export interface ApiResponse {
  level: string
  reason: string
  suggestions: string[]
  explanation: string
  usage: ApiUsage[]
}

export async function evaluateSentence(
  keyword: string,
  sentence: string,
  scenario: string,
  apiConfig: { apiKey: string; endpoint: string },
): Promise<ApiResponse> {
  if (!apiConfig.apiKey.trim()) {
    throw new Error('API配置未完成，请先配置API Key')
  }

  const response = await fetch(apiConfig.endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiConfig.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: {
        prompt: '[任务]',
        biz_params: {
          keyword,
          sentence,
          scenario,
        },
      },
      parameters: {},
      debug: {},
    }),
  })

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const text = data.output?.text

  if (!text) {
    throw new Error('API响应格式错误 I')
  }

  const result = JSON.parse(text)
  if (!result.reason || !result.level) {
    throw new Error('API响应格式错误 II')
  }

  // 解析 usage 信息
  const usage = data.usage.models
  let apiUsage: ApiUsage[] = []
  if (!Array.isArray(usage)) {
    apiUsage = []
  } else {
    apiUsage = usage.map((rawUsage) => ({
      inputTokens: rawUsage.input_tokens,
      outputTokens: rawUsage.output_tokens,
      modelId: rawUsage.model_id,
    }))
  }

  return {
    level: result.level,
    reason: result.reason,
    suggestions: result.suggestions || [],
    explanation: result.explanation || '',
    usage: apiUsage,
  }
}

export async function evaluateTranslation(
  original: string,
  translations: string[][],
  apiConfig: { apiKey: string; endpoint: string },
): Promise<TranslationComparisonEvaluation> {
  if (!apiConfig.apiKey.trim()) {
    throw new Error('API配置未完成，请先配置API Key')
  }

  // 将 translations 转换为查询字符串格式
  const translationText = translations
    .map((options) => {
      if (options.length === 1) {
        return options[0]
      }
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
      const optionsText = options.map((option, i) => `${letters[i]}. ${option}`).join(' / ')
      return `(${optionsText})`
    })
    .join(' ')

  const response = await fetch(apiConfig.endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiConfig.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: {
        prompt: translationText,
        biz_params: {
          original,
        },
      },
      parameters: {},
      debug: {},
    }),
  })

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const text = data.output?.text

  if (!text) {
    throw new Error('API响应格式错误 I')
  }

  const result = JSON.parse(text)
  if (!result.explanation || !result.options) {
    throw new Error('API响应格式错误 II')
  }

  // 解析 usage 信息
  const usage = data.usage.models
  let apiUsage: ApiUsage[] = []
  if (!Array.isArray(usage)) {
    apiUsage = []
  } else {
    apiUsage = usage.map((rawUsage) => ({
      inputTokens: rawUsage.input_tokens,
      outputTokens: rawUsage.output_tokens,
      modelId: rawUsage.model_id,
    }))
  }

  return {
    explanation: result.explanation,
    options: result.options,
    usage: apiUsage,
  }
}
