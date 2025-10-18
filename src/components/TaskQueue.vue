<template>
  <div class="task-queue">
    <div class="queue-header">
      <h2>任务队列</h2>
      <div class="queue-stats">
        <span class="stat pending">待处理: {{ pendingTasks.length }}</span>
        <span class="stat processing">处理中: {{ processingTaskId ? 1 : 0 }}</span>
        <span class="stat completed">已完成: {{ completedTasks.length }}</span>
        <span class="stat failed">失败: {{ failedTasks.length }}</span>
      </div>
    </div>

    <!-- 处理中的任务 -->
    <div v-if="currentProcessingTask" class="processing-section">
      <h3>正在处理</h3>
      <div class="task-item processing">
        <div class="task-header">
          <span class="task-keyword">{{ currentProcessingTask.keyword }}</span>
          <div class="task-status-container">
            <LoadingSpinner :show="true" size="small" :center="false" />
            <span class="task-status processing">处理中...</span>
          </div>
        </div>
        <div class="task-sentence">{{ currentProcessingTask.sentence }}</div>
        <div v-if="currentProcessingTask.scenario" class="task-scenario">
          场景: {{ currentProcessingTask.scenario }}
        </div>
      </div>
    </div>

    <!-- 待处理任务 -->
    <div v-if="pendingTasks.length > 0" class="pending-section">
      <h3>待处理任务</h3>
      <div class="task-list">
        <div v-for="task in pendingTasks" :key="task.id" class="task-item pending">
          <div class="task-header">
            <span class="task-keyword">{{ task.keyword }}</span>
            <span class="task-status pending">等待中</span>
          </div>
          <div class="task-sentence">{{ task.sentence }}</div>
          <div v-if="task.scenario" class="task-scenario">场景: {{ task.scenario }}</div>
          <div class="task-actions">
            <button class="btn-danger btn-small" @click="removeTask(task.id)">取消</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 已完成任务 -->
    <div v-if="completedTasks.length > 0" class="completed-section">
      <div class="section-header">
        <h3>已完成任务</h3>
        <button class="btn-secondary btn-small" @click="clearCompletedTasks">清空已完成</button>
      </div>
      <div class="task-list">
        <div v-for="task in completedTasks.slice(0, 10)" :key="task.id" class="task-item completed">
          <div class="task-header">
            <span class="task-keyword">{{ task.keyword }}</span>
            <span class="task-status completed" :class="getLevelClass(task.result?.level)">
              {{ task.result?.level }}
            </span>
          </div>
          <div class="task-sentence">{{ task.sentence }}</div>
          <div v-if="task.result" class="task-result">
            <div class="result-reason">{{ task.result.reason }}</div>
            <div
              v-if="task.result.suggestions && task.result.suggestions.length > 0"
              class="result-suggestions"
            >
              <strong>建议:</strong>
              <ul>
                <li v-for="(suggestion, index) in task.result.suggestions" :key="index">
                  {{ suggestion }}
                </li>
              </ul>
            </div>
            <div v-if="task.result.explanation" class="result-explanation">
              <strong>解释:</strong> {{ task.result.explanation }}
            </div>
          </div>
          <div class="task-actions">
            <span class="task-time">
              {{ formatTime(task.completedAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 失败任务 -->
    <div v-if="failedTasks.length > 0" class="failed-section">
      <h3>失败任务</h3>
      <div class="task-list">
        <div v-for="task in failedTasks" :key="task.id" class="task-item failed">
          <div class="task-header">
            <span class="task-keyword">{{ task.keyword }}</span>
            <span class="task-status failed">失败</span>
          </div>
          <div class="task-sentence">{{ task.sentence }}</div>
          <div class="task-error">{{ task.error }}</div>
          <div class="task-actions">
            <button class="btn-danger btn-small" @click="removeTask(task.id)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="tasks.length === 0" class="empty-state">
      <p>暂无任务，请先提交句子进行评估</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, inject } from 'vue'
import { useTaskQueueStore } from '@/stores/taskQueue'
import LoadingSpinner from './LoadingSpinner.vue'

// 注入全局错误处理
const showError =
  inject<(error: { title: string; message: string; details?: string }) => void>('showError')

const taskQueueStore = useTaskQueueStore()

const tasks = computed(() => taskQueueStore.tasks)
const pendingTasks = computed(() => taskQueueStore.pendingTasks)
const completedTasks = computed(() => taskQueueStore.completedTasks)
const failedTasks = computed(() => taskQueueStore.failedTasks)
const currentProcessingTask = computed(() => taskQueueStore.currentProcessingTask)
const processingTaskId = computed(() => taskQueueStore.processingTaskId)

onMounted(() => {
  taskQueueStore.loadTasksFromStorage()
})

function removeTask(taskId: string) {
  try {
    taskQueueStore.removeTask(taskId)
  } catch (error) {
    showError?.({
      title: '删除失败',
      message: '无法删除任务，请重试',
      details: error instanceof Error ? error.message : '未知错误',
    })
  }
}

function clearCompletedTasks() {
  try {
    taskQueueStore.clearCompletedTasks()
  } catch (error) {
    showError?.({
      title: '清理失败',
      message: '无法清空已完成任务，请重试',
      details: error instanceof Error ? error.message : '未知错误',
    })
  }
}

function getLevelClass(level?: string): string {
  if (!level) return ''

  if (level.includes('A+') || level.includes('A')) {
    return 'level-excellent'
  } else if (level.includes('B+') || level.includes('B')) {
    return 'level-good'
  } else {
    return 'level-average'
  }
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.task-queue {
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
}

.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9ecef;
}

.queue-stats {
  display: flex;
  gap: 15px;
}

.stat {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stat.pending {
  background: #fff3cd;
  color: #856404;
}

.stat.processing {
  background: #cce7ff;
  color: #004085;
}

.stat.completed {
  background: #d4edda;
  color: #155724;
}

.stat.failed {
  background: #f8d7da;
  color: #721c24;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-item.processing {
  border-left: 4px solid #17a2b8;
}

.task-item.pending {
  border-left: 4px solid #ffc107;
}

.task-item.completed {
  border-left: 4px solid #20c997;
}

.task-item.failed {
  border-left: 4px solid #dc3545;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-keyword {
  font-weight: 600;
  color: #333;
}

.task-status-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-status {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.task-status.pending {
  background: #fff3cd;
  color: #856404;
}

.task-status.processing {
  background: #cce7ff;
  color: #004085;
}

.task-status.completed {
  background: #d4edda;
  color: #155724;
}

.task-status.failed {
  background: #f8d7da;
  color: #721c24;
}

.level-excellent {
  background: #28a745 !important;
  color: white !important;
}

.level-good {
  background: #17a2b8 !important;
  color: white !important;
}

.level-average {
  background: #ffc107 !important;
  color: #212529 !important;
}

.task-sentence {
  margin-bottom: 8px;
  color: #555;
  line-height: 1.4;
}

.task-scenario {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
}

.task-result {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e9ecef;
}

.result-reason {
  margin-bottom: 8px;
  color: #333;
}

.result-suggestions {
  margin-bottom: 8px;
}

.result-suggestions ul {
  margin: 5px 0;
  padding-left: 20px;
}

.result-suggestions li {
  margin-bottom: 3px;
  color: #555;
}

.result-explanation {
  color: #666;
}

.task-error {
  color: #dc3545;
  font-size: 14px;
  margin-top: 8px;
}

.task-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.btn-small {
  padding: 5px 10px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.task-time {
  font-size: 12px;
  color: #6c757d;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

h3 {
  margin: 20px 0 15px 0;
  color: #333;
  font-size: 18px;
}

.processing-section,
.pending-section,
.completed-section,
.failed-section {
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .queue-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .queue-stats {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .task-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .task-status-container {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .task-queue {
    padding: 15px;
  }

  .queue-stats {
    gap: 8px;
  }

  .stat {
    font-size: 11px;
    padding: 4px 8px;
  }

  .task-item {
    padding: 12px;
  }

  .task-keyword {
    font-size: 1rem;
  }

  .task-sentence {
    font-size: 0.9rem;
  }

  .result-suggestions ul {
    padding-left: 15px;
  }
}
</style>
