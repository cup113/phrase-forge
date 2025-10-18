import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ApiConfig {
  apiKey: string
  endpoint: string
}

export const useApiConfigStore = defineStore('apiConfig', () => {
  const apiConfig = ref<ApiConfig>({
    apiKey: '',
    endpoint:
      'https://dashscope.aliyuncs.com/api/v1/apps/c64617ac89584dafaaa72de357e3c184/completion',
  })

  const isConfigured = computed(() => {
    return apiConfig.value.apiKey.trim().length > 0
  })

  function setApiConfig(config: Partial<ApiConfig>) {
    apiConfig.value = { ...apiConfig.value, ...config }
    // 保存到localStorage
    localStorage.setItem('phrase-forge-api-config', JSON.stringify(apiConfig.value))
  }

  function loadApiConfig() {
    const saved = localStorage.getItem('phrase-forge-api-config')
    if (saved) {
      try {
        apiConfig.value = { ...apiConfig.value, ...JSON.parse(saved) }
      } catch (error) {
        console.error('Failed to load API config:', error)
      }
    }
  }
  
  loadApiConfig()

  return {
    apiConfig,
    isConfigured,
    setApiConfig,
    loadApiConfig,
  }
})
