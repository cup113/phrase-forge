import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { ApiConfig } from '../types'

export const useApiConfigStore = defineStore('apiConfig', () => {
  const defaultConfig: ApiConfig = {
    apiKey: '',
    endpoint:
      'https://dashscope.aliyuncs.com/api/v1/apps/c64617ac89584dafaaa72de357e3c184/completion',
  }

  const apiConfig = useLocalStorage<ApiConfig>('phrase-forge-api-config', defaultConfig)

  const isConfigured = computed(() => {
    return apiConfig.value.apiKey.trim().length > 0
  })

  function setApiConfig(config: Partial<ApiConfig>) {
    apiConfig.value = { ...apiConfig.value, ...config }
  }

  return {
    apiConfig,
    isConfigured,
    setApiConfig,
  }
})
