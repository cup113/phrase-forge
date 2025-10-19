<template>
  <div class="data-manager">
    <h3>数据管理</h3>

    <div class="data-actions">
      <!-- 导出数据 -->
      <div class="action-card">
        <div class="action-icon">📤</div>
        <div class="action-content">
          <h4>导出数据</h4>
          <p>将您的学习历史导出为JSON文件，用于备份或迁移</p>
          <button class="btn-primary" @click="exportAllData">导出全部数据</button>
        </div>
      </div>

      <!-- 导入数据 -->
      <div class="action-card">
        <div class="action-icon">📥</div>
        <div class="action-content">
          <h4>导入数据</h4>
          <p>从JSON文件导入之前备份的学习历史数据</p>
          <div class="import-section">
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              @change="handleFileImport"
              style="display: none"
            />
            <button class="btn-secondary" @click="triggerFileInput">选择文件</button>
            <span v-if="selectedFile" class="file-name">{{ selectedFile.name }}</span>
          </div>
          <button class="btn-primary" @click="importData" :disabled="!selectedFile">
            导入数据
          </button>
        </div>
      </div>

      <!-- 数据统计 -->
      <div class="action-card">
        <div class="action-icon">📊</div>
        <div class="action-content">
          <h4>数据统计</h4>
          <div class="data-stats">
            <div class="data-stat">
              <span class="stat-label">历史记录:</span>
              <span class="stat-value">{{ historyCount }} 条</span>
            </div>
            <div class="data-stat">
              <span class="stat-label">任务队列:</span>
              <span class="stat-value">{{ taskCount }} 个</span>
            </div>
            <div class="data-stat">
              <span class="stat-label">存储大小:</span>
              <span class="stat-value">{{ storageSize }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据清理 -->
      <div class="action-card">
        <div class="action-icon">🧹</div>
        <div class="action-content">
          <h4>数据清理</h4>
          <p>清理不需要的数据以释放存储空间</p>
          <div class="cleanup-actions">
            <button class="btn-danger" @click="clearCompletedTasks">清空已完成任务</button>
            <button class="btn-danger" @click="clearAllData">清空所有数据</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作结果提示 -->
    <div v-if="operationMessage" class="operation-result" :class="operationType">
      {{ operationMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHistoryStore } from '@/stores/history'
import { useTaskQueueStore } from '@/stores/taskQueue'
import { useApiConfigStore } from '@/stores/apiConfig'

const historyStore = useHistoryStore()
const taskQueueStore = useTaskQueueStore()
const apiConfigStore = useApiConfigStore()

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const operationMessage = ref('')
const operationType = ref<'success' | 'error'>('success')

// 数据统计
const historyCount = computed(() => historyStore.history.length)
const taskCount = computed(() => taskQueueStore.tasks.length)

const storageSize = computed(() => {
  const historyData = JSON.stringify(historyStore.history)
  const taskData = JSON.stringify(taskQueueStore.tasks)
  const configData = JSON.stringify(apiConfigStore.apiConfig)

  const totalSize = historyData.length + taskData.length + configData.length

  if (totalSize < 1024) {
    return totalSize + ' B'
  } else if (totalSize < 1024 * 1024) {
    return (totalSize / 1024).toFixed(1) + ' KB'
  } else {
    return (totalSize / (1024 * 1024)).toFixed(1) + ' MB'
  }
})

// VueUse 自动处理存储，无需手动加载

// 导出所有数据
function exportAllData() {
  try {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      history: historyStore.history,
      tasks: taskQueueStore.tasks,
      stats: {
        totalHistory: historyCount.value,
        totalTasks: taskCount.value,
        storageSize: storageSize.value,
      },
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `phrase-forge-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showMessage('数据导出成功！', 'success')
  } catch (error) {
    console.error('导出失败:', error)
    showMessage('数据导出失败，请重试', 'error')
  }
}

// 文件导入处理
function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

function importData() {
  if (!selectedFile.value) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const importData = JSON.parse(content)

      // 验证数据格式
      if (!importData.version || !importData.history) {
        throw new Error('无效的数据格式')
      }

      // 导入历史数据
      if (Array.isArray(importData.history)) {
        const success = historyStore.importHistory(JSON.stringify(importData.history))
        if (success) {
          showMessage(`成功导入 ${importData.history.length} 条历史记录`, 'success')
        } else {
          throw new Error('历史记录导入失败')
        }
      }

      // 重置文件选择
      selectedFile.value = null
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    } catch (error) {
      console.error('导入失败:', error)
      showMessage('数据导入失败，请检查文件格式', 'error')
    }
  }

  reader.readAsText(selectedFile.value)
}

// 数据清理
function clearCompletedTasks() {
  if (confirm('确定要清空所有已完成的任务吗？此操作不可恢复。')) {
    taskQueueStore.clearCompletedTasks()
    showMessage('已完成任务已清空', 'success')
  }
}

function clearAllData() {
  if (confirm('确定要清空所有数据吗？包括历史记录和任务队列。此操作不可恢复！')) {
    historyStore.clearHistory()
    taskQueueStore.clearAllTasks()
    showMessage('所有数据已清空', 'success')
  }
}

// 显示操作消息
function showMessage(message: string, type: 'success' | 'error') {
  operationMessage.value = message
  operationType.value = type

  setTimeout(() => {
    operationMessage.value = ''
  }, 3000)
}
</script>

<style scoped>
.data-manager {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.data-manager h3 {
  margin: 0 0 25px 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.data-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.action-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 15px;
  text-align: center;
}

.action-content h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.action-content p {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.import-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.file-name {
  font-size: 0.85rem;
  color: #666;
  word-break: break-all;
}

.data-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.data-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.stat-value {
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
}

.cleanup-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 按钮样式 */
.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  width: 100%;
}

.btn-primary {
  background: #20c997;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1db489;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

/* 操作结果提示 */
.operation-result {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  animation: slideIn 0.3s ease;
}

.operation-result.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.operation-result.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-actions {
    grid-template-columns: 1fr;
  }

  .import-section {
    flex-direction: column;
    align-items: stretch;
  }

  .data-manager {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .action-card {
    padding: 15px;
  }

  .cleanup-actions {
    gap: 8px;
  }
}
</style>
