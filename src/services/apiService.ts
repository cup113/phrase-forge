import type { ApiUsage } from '@/types'

export interface ApiResponse {
  level: string
  reason: string
  suggestions: string[]
  explanation: string
  usage?: ApiUsage
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
  const usage = data.usage?.models?.[0]
  const apiUsage: ApiUsage | undefined = usage
    ? {
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        modelId: usage.model_id,
      }
    : undefined

  return {
    level: result.level,
    reason: result.reason,
    suggestions: result.suggestions || [],
    explanation: result.explanation || '',
    usage: apiUsage,
  }
}
