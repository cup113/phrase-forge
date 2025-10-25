<template>
  <div id="app">
    <!-- 全局错误处理 -->
    <GlobalError ref="globalError" />

    <!-- 全局加载状态 -->
    <LoadingSpinner :show="globalLoading" message="处理中..." overlay center />

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import GlobalError from '@/components/GlobalError.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const globalError = ref<InstanceType<typeof GlobalError>>()
const globalLoading = ref(false)

// 提供全局错误处理函数
function showError(error: {
  title: string
  message: string
  details?: string
  retryAction?: () => void
}) {
  globalError.value?.showGlobalError(error)
}

// 提供全局加载状态控制
function setGlobalLoading(loading: boolean) {
  globalLoading.value = loading
}

// 注入到所有子组件
provide('showError', showError)
provide('setGlobalLoading', setGlobalLoading)
</script>

<style>
:root {
  /* 主色调 */
  --color-primary: #20c997;
  --color-secondary: #17a2b8;
  --color-success: #28a745;
  --color-warning: #ffc107;
  --color-danger: #dc3545;
  --color-info: #667eea;

  /* 中性色 */
  --color-gray-100: #f8f9fa;
  --color-gray-200: #e9ecef;
  --color-gray-300: #dee2e6;
  --color-gray-400: #ced4da;
  --color-gray-500: #6c757d;
  --color-gray-600: #545b62;
  --color-gray-700: #495057;
  --color-gray-800: #343a40;
  --color-gray-900: #212529;

  /* 语义色 */
  --color-text-primary: #333;
  --color-text-secondary: #666;
  --color-text-muted: #6c757d;
  --color-border: #e9ecef;
  --color-background: linear-gradient(135deg, var(--color-gray-100) 0%, var(--color-gray-200) 100%);
  --color-surface: rgba(255, 255, 255, 0.95);

  /* 响应式断点 */
  --breakpoint-md: 768px;
  --breakpoint-sm: 480px;

  /* 通用样式 */
  --border-radius: 8px;
  --border-radius-sm: 6px;
  --border-radius-lg: 12px;
  --box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  --box-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --transition: all 0.2s ease;
  --transition-slow: all 0.3s ease;

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 25px;
  --spacing-3xl: 30px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
    'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
  color: var(--color-text-primary);
  background: var(--color-background);
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100vh;
}

.flex-grow {
  flex-grow: 1;
}

.form-group {
  margin-bottom: var(--spacing-xl);
}

label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 14px;
}

.label-icon {
  font-size: 16px;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(32, 201, 151, 0.1);
  transform: translateY(-1px);
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-2xl);
}

.form-actions-secondary {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-2xl);
}

/* 全局按钮样式 */
button {
  font-family: inherit;
  transition: var(--transition);
}

button:focus {
  outline: none;
}

/* 全局输入框样式 */
input,
textarea {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
  background: white;
  transition: var(--transition);
}

/* 全局链接样式 */
a {
  color: var(--color-secondary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-gray-100);
}

::-webkit-scrollbar-thumb {
  background: var(--color-gray-400);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-500);
}

/* ===== 通用工具类 ===== */

/* 按钮基础样式 */
.btn,
.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  justify-content: center;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(32, 201, 151, 0.3);
}

.btn-primary:disabled {
  background: var(--color-gray-500);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: var(--color-gray-500);
  color: white;
}

.btn-secondary:hover {
  background: var(--color-gray-600);
  transform: translateY(-1px);
}

.btn-tertiary {
  background: white;
  color: var(--color-gray-500);
  border: 1px solid var(--color-gray-500);
}

.btn-tertiary:hover {
  background: var(--color-gray-100);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.btn-small {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 12px;
}

.btn-action {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 11px;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
}

.btn-recreate {
  background: var(--color-secondary);
  color: white;
}

.btn-recreate:hover {
  background: #138496;
}

.btn-retry {
  background: var(--color-warning);
  color: var(--color-gray-900);
}

.btn-retry:hover {
  background: #e0a800;
}

.btn-delete {
  background: var(--color-danger);
  color: white;
}

.btn-delete:hover {
  background: #c82333;
}

/* 卡片样式 */
.card {
  background: var(--color-surface);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--box-shadow);
}

.card-sm {
  padding: var(--spacing-lg);
}

.card-md {
  padding: var(--spacing-2xl);
}

.card-lg {
  padding: var(--spacing-3xl);
}

/* 表单样式 */
.form-group {
  margin-bottom: var(--spacing-xl);
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 14px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-2xl);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
  background: white;
  transition: var(--transition);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(32, 201, 151, 0.1);
  transform: translateY(-1px);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* 状态样式 */
.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-processing {
  background: #cce7ff;
  color: #004085;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-failed {
  background: #f8d7da;
  color: #721c24;
}

.level-excellent {
  background: var(--color-success) !important;
  color: white !important;
}

.level-good {
  background: var(--color-secondary) !important;
  color: white !important;
}

.level-average {
  background: var(--color-warning) !important;
  color: var(--color-gray-900) !important;
}

/* 响应式工具类 */
@media (max-width: var(--breakpoint-md)) {
  .mobile-column {
    flex-direction: column;
  }

  .mobile-center {
    text-align: center;
  }

  .mobile-full-width {
    width: 100%;
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .mobile-sm-column {
    flex-direction: column;
  }
}
</style>
