<template>
  <div v-if="showError" class="global-error">
    <div class="error-overlay" @click="closeError"></div>
    <div class="error-modal">
      <div class="error-header">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">{{ errorTitle }}</h3>
        <button class="error-close" @click="closeError">×</button>
      </div>
      <div class="error-content">
        <p>{{ errorMessage }}</p>
        <div v-if="errorDetails" class="error-details">
          <details>
            <summary>详细信息</summary>
            <pre>{{ errorDetails }}</pre>
          </details>
        </div>
      </div>
      <div class="error-actions">
        <button class="btn-primary" @click="closeError">确定</button>
        <button v-if="showRetry" class="btn-secondary" @click="retryAction">重试</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface ErrorState {
  title: string
  message: string
  details?: string
  retryAction?: () => void
}

const errorState = ref<ErrorState | null>(null)

const showError = computed(() => errorState.value !== null)
const errorTitle = computed(() => errorState.value?.title || '错误')
const errorMessage = computed(() => errorState.value?.message || '发生未知错误')
const errorDetails = computed(() => errorState.value?.details)
const showRetry = computed(() => !!errorState.value?.retryAction)

function showGlobalError(error: ErrorState) {
  errorState.value = error
}

function closeError() {
  errorState.value = null
}

function retryAction() {
  if (errorState.value?.retryAction) {
    errorState.value.retryAction()
  }
  closeError()
}

// 暴露给全局使用
defineExpose({
  showGlobalError,
  closeError,
})
</script>

<style scoped>
.global-error {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.error-modal {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.error-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
}

.error-icon {
  font-size: 1.5rem;
}

.error-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  flex: 1;
}

.error-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.error-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.error-content {
  padding: 24px;
}

.error-content p {
  margin: 0 0 16px 0;
  color: #333;
  line-height: 1.5;
  font-size: 14px;
}

.error-details {
  margin-top: 16px;
}

.error-details summary {
  cursor: pointer;
  color: #667eea;
  font-weight: 500;
  font-size: 13px;
  margin-bottom: 8px;
}

.error-details pre {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
  overflow-x: auto;
  margin: 0;
  border: 1px solid #e9ecef;
}

.error-actions {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px 24px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .global-error {
    padding: 10px;
  }

  .error-modal {
    max-width: none;
  }

  .error-header {
    padding: 16px 20px;
  }

  .error-content {
    padding: 20px;
  }

  .error-actions {
    padding: 0 20px 20px 20px;
    flex-direction: column;
  }
}
</style>
