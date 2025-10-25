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

const tasks = computed(() => {
  return taskQueueStore.tasks.slice().sort((a, b) => {
    // incomplete 任务排在最后
    if (a.status === 'incomplete' && b.status !== 'incomplete') return 1
    if (a.status !== 'incomplete' && b.status === 'incomplete') return -1
    // 其他任务按创建时间倒序排列
    return b.createdAt - a.createdAt
  })
})

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
  taskQueueStore.removeTask(taskId)
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
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.queue-stats {
  display: flex;
  gap: var(--spacing-2xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-muted);
}

h3 {
  margin: var(--spacing-xl) 0 var(--spacing-2xl) 0;
  color: var(--color-text-primary);
  font-size: 18px;
}

.section {
  margin-bottom: var(--spacing-xl);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .queue-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2xl);
  }

  .queue-stats {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .task-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .task-status-container {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .task-queue {
    padding: var(--spacing-2xl);
  }

  .queue-stats {
    gap: var(--spacing-sm);
  }

  .stat {
    font-size: 11px;
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .task-item {
    padding: var(--spacing-md);
  }

  .task-keyword {
    font-size: 1rem;
  }

  .task-sentence {
    font-size: 0.9rem;
  }

  .result-suggestions ul {
    padding-left: var(--spacing-2xl);
  }
}
</style>
