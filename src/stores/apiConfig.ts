import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { ApiConfig } from '../types'

export const useApiConfigStore = defineStore('apiConfig', () => {
  const sentenceMakingEndpoint =
    'https://dashscope.aliyuncs.com/api/v1/apps/c64617ac89584dafaaa72de357e3c184/completion'
  const translationComparisonEndpoint =
    'https://dashscope.aliyuncs.com/api/v1/apps/cc1d2ea1191345f3999745e31f4ebff4/completion'

  const defaultConfig: ApiConfig = {
    apiKey: '',
    sentenceMakingEndpoint,
    translationComparisonEndpoint,
  }

  const apiConfig = useLocalStorage<ApiConfig>('phrase-forge-api-config', defaultConfig)

  initApiConfig()

  function initApiConfig() {
    if (!apiConfig.value.sentenceMakingEndpoint) {
      if (apiConfig.value.endpoint) {
        apiConfig.value.sentenceMakingEndpoint = apiConfig.value.endpoint
      } else {
        apiConfig.value.sentenceMakingEndpoint = sentenceMakingEndpoint
      }
    }

    if (!apiConfig.value.translationComparisonEndpoint) {
      apiConfig.value.translationComparisonEndpoint = translationComparisonEndpoint
    }
  }

  const isConfigured = computed(() => {
    return apiConfig.value.apiKey.trim().length > 0
  })

  function setApiConfig(config: Partial<ApiConfig>) {
    apiConfig.value = { ...apiConfig.value, ...config }
  }

  function getEndpointForTaskType(taskType?: string): string {
    return taskType === 'translation-comparison'
      ? translationComparisonEndpoint
      : sentenceMakingEndpoint
  }

  return {
    apiConfig,
    isConfigured,
    setApiConfig,
    getEndpointForTaskType,
  }
})
