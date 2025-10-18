import { useApiConfigStore } from '@/stores/apiConfig'
import type { Task } from '@/stores/taskQueue'

export interface ApiResponse {
  level: string
  reason: string
  suggestions: string[]
  explanation: string
}

export class ApiService {
  private get apiConfigStore() {
    return useApiConfigStore()
  }

  async evaluateSentence(
    keyword: string,
    sentence: string,
    scenario: string,
  ): Promise<ApiResponse> {
    if (!this.apiConfigStore.isConfigured) {
      throw new Error('API配置未完成，请先配置API Key')
    }

    const response = await fetch(this.apiConfigStore.apiConfig.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiConfigStore.apiConfig.apiKey}`,
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

    return {
      level: result.level,
      reason: result.reason,
      suggestions: result.suggestions || [],
      explanation: result.explanation || '',
    }
  }

  async processTask(task: Task): Promise<ApiResponse> {
    return await this.evaluateSentence(task.keyword, task.sentence, task.scenario)
  }
}

export const apiService = new ApiService()
