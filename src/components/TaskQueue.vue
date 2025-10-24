<template>
  <div class="task-queue">
    <div class="queue-header">
      <h2>任务队列</h2>
      <button class="btn-secondary btn-small" @click="clearTasks">清空</button>
    </div>

    <div v-if="tasks.length > 0" class="section">
      <div class="task-list">
        <TaskItem
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          @recreate="handleRecreate"
          @retry="handleRetry"
          @delete="handleDelete"
        />
      </div>
    </div>

    <div v-if="tasks.length === 0" class="empty-state">
      <p>暂无任务，请先提交句子进行评估</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { useTaskQueueStore } from '@/stores/taskQueue'
import TaskItem from './TaskItem.vue'

// 注入全局错误处理
const showError =
  inject<(error: { title: string; message: string; details?: string }) => void>('showError')

const taskQueueStore = useTaskQueueStore()

const tasks = computed(() => taskQueueStore.tasks.slice().sort((a, b) => b.createdAt - a.createdAt))

function clearTasks() {
  try {
    taskQueueStore.clearAllTasks()
  } catch (error) {
    showError?.({
      title: '清理失败',
      message: '无法清空已完成任务，请重试',
      details: error instanceof Error ? error.message : '未知错误',
    })
  }
}

function handleRecreate(taskId: string) {
  taskQueueStore.recreateTask(taskId)
}

function handleRetry(taskId: string) {
  taskQueueStore.retryTask(taskId)
}

function handleDelete(taskId: string) {
  if (confirm('确定要删除这个任务吗？')) {
    taskQueueStore.removeTask(taskId)
  }
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

.section {
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
