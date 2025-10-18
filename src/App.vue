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
  color: #333;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100vh;
}

/* 全局按钮样式 */
button {
  font-family: inherit;
  transition: all 0.2s ease;
}

button:focus {
  outline: none;
}

/* 全局输入框样式 */
input,
textarea {
  font-family: inherit;
}

/* 全局链接样式 */
a {
  color: #007bff;
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
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
