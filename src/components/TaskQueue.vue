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
      <TaskItem :task="currentProcessingTask" status="processing" />
    </div>

    <!-- 待处理任务 -->
    <div v-if="pendingTasks.length > 0" class="pending-section">
      <h3>待处理任务</h3>
      <div class="task-list">
        <TaskItem v-for="task in pendingTasks" :key="task.id" :task="task" status="pending">
          <template #actions>
            <button class="btn-danger btn-small" @click="removeTask(task.id)">取消</button>
          </template>
        </TaskItem>
      </div>
    </div>

    <!-- 已完成任务 -->
    <div v-if="completedTasks.length > 0" class="completed-section">
      <div class="section-header">
        <h3>已完成任务</h3>
        <button class="btn-secondary btn-small" @click="clearCompletedTasks">清空已完成</button>
      </div>
      <div class="task-list">
        <TaskItem
          v-for="task in completedTasks.slice(0, 10)"
          :key="task.id"
          :task="task"
          status="completed"
        />
      </div>
    </div>

    <!-- 失败任务 -->
    <div v-if="failedTasks.length > 0" class="failed-section">
      <h3>失败任务</h3>
      <div class="task-list">
        <TaskItem v-for="task in failedTasks" :key="task.id" :task="task" status="failed">
          <template #actions>
            <button class="btn-danger btn-small" @click="removeTask(task.id)">删除</button>
          </template>
        </TaskItem>
      </div>
    </div>

    <!-- 空状态 -->
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

const tasks = computed(() => taskQueueStore.tasks)
const pendingTasks = computed(() => taskQueueStore.pendingTasks)
const completedTasks = computed(() => taskQueueStore.completedTasks)
const failedTasks = computed(() => taskQueueStore.failedTasks)
const currentProcessingTask = computed(() => taskQueueStore.currentProcessingTask)
const processingTaskId = computed(() => taskQueueStore.processingTaskId)

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
