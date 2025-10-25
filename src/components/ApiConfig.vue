<template>
  <div class="api-config">
    <div class="config-header">
      <div class="config-icon">🔑</div>
      <div class="config-title">
        <h2>API 配置</h2>
        <p>配置您的 API 密钥以开始使用语匠</p>
      </div>
    </div>

    <form @submit.prevent="saveConfig" class="config-form">
      <div class="form-group">
        <label for="apiKey">
          <span class="label-icon">🔒</span>
          API Key (暂只支持阿里云百炼)
        </label>
        <input
          id="apiKey"
          v-model="apiKey"
          type="password"
          placeholder="请输入您的API Key"
          required
        />
        <small class="help-text">
          <span class="help-icon">💡</span>
          请确保您的 API Key 有足够的额度，我们不会存储您的 API Key
        </small>
      </div>

      <div class="form-group">
        <label for="endpoint">
          <span class="label-icon">🌐</span>
          API端点（不建议修改）
        </label>
        <input
          id="endpoint"
          v-model="endpoint"
          type="url"
          placeholder="请输入API 端点 URL"
          required
        />
        <small class="help-text">
          <span class="help-icon">📝</span>
          通义千问工作流端点，建议使用默认
        </small>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary flex-grow">
          <span class="btn-icon">💾</span>
          保存配置
        </button>
        <button type="button" class="btn-secondary flex-grow" @click="resetConfig">
          <span class="btn-icon">🔄</span>
          重置
        </button>
      </div>
    </form>

    <div v-if="isConfigured" class="config-status">
      <div class="status-success">
        <span class="status-icon">✅</span>
        <div class="status-content">
          <strong>配置完成</strong>
          <span>API配置已完成，可以开始使用语匠了！</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApiConfigStore } from '@/stores/apiConfig'

const apiConfigStore = useApiConfigStore()

const apiKey = ref('')
const endpoint = ref('')

const isConfigured = apiConfigStore.isConfigured

onMounted(() => {
  apiKey.value = apiConfigStore.apiConfig.apiKey
  endpoint.value = apiConfigStore.apiConfig.endpoint
})

function saveConfig() {
  apiConfigStore.setApiConfig({
    apiKey: apiKey.value,
    endpoint: endpoint.value,
  })
}

function resetConfig() {
  apiKey.value = ''
  endpoint.value = apiConfigStore.apiConfig.endpoint
}
</script>

<style scoped>
.api-config {
  max-width: 500px;
  margin: 0 auto;
}

.config-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.config-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #20c997, #17a2b8);
  border-radius: 12px;
  color: white;
}

.config-title h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.config-title p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 0.9rem;
}

.config-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 25px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.label-icon {
  font-size: 16px;
}

input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  background: white;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #20c997;
  box-shadow: 0 0 0 3px rgba(32, 201, 151, 0.1);
  transform: translateY(-1px);
}

.help-text {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 8px;
  color: #6c757d;
  font-size: 12px;
  line-height: 1.4;
}

.help-icon {
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 1px;
}

.config-status {
  margin-top: 20px;
}

.status-success {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.1);
}

.status-icon {
  font-size: 1.2rem;
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-content strong {
  font-size: 14px;
}

.status-content span {
  font-size: 12px;
  opacity: 0.9;
}
</style>
