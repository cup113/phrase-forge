<template>
  <div class="home">
    <header class="app-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="app-title">语匠 - Phrase Forge</h1>
          <p class="app-subtitle">英语写作智能辅助工具</p>
        </div>
        <nav class="header-nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/history" class="nav-link">学习历史</router-link>
          <router-link to="/settings" class="nav-link">设置</router-link>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <!-- 输入表单区域 -->
      <section class="input-section">
        <InputForm />
      </section>

      <!-- 任务队列区域 -->
      <section class="queue-section">
        <TaskQueue />
      </section>
    </main>

    <footer class="app-footer">
      <p>&copy; 2025 语匠 - 提升英语写作能力</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import InputForm from '@/components/InputForm.vue'
import TaskQueue from '@/components/TaskQueue.vue'
import { taskProcessor } from '@/services/taskProcessor'
import { useTaskQueueStore } from '@/stores/taskQueue'
import { useHistoryStore } from '@/stores/history'

const taskQueueStore = useTaskQueueStore()
const historyStore = useHistoryStore()

onMounted(() => {
  // 加载存储的数据
  taskQueueStore.loadTasksFromStorage()
  historyStore.loadHistoryFromStorage()

  // 启动任务处理器
  taskProcessor.startProcessing(
    () => taskQueueStore.pendingTasks,
    (taskId: string) => taskQueueStore.startProcessing(taskId),
    (taskId: string, result: any) => {
      taskQueueStore.completeTask(taskId, result)
      const task = taskQueueStore.tasks.find((t) => t.id === taskId)
      if (task) {
        historyStore.addRecord({ ...task, status: 'completed', result })
      }
    },
    (taskId: string, error: string) => {
      taskQueueStore.failTask(taskId, error)
    },
  )
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  background: linear-gradient(135deg, #20c997, #17a2b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-main {
  text-align: left;
}

.app-subtitle {
  margin: 10px 0 0 0;
  font-size: 1.1rem;
  color: #666;
  font-weight: 300;
}

.header-nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(32, 201, 151, 0.1);
  color: #20c997;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: start;
}

.input-section,
.queue-section {
  margin-bottom: 0;
}

.app-footer {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  text-align: center;
  padding: 20px;
  margin-top: auto;
}

.app-footer p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .header-main {
    text-align: center;
  }

  .header-nav {
    justify-content: center;
  }

  .app-title {
    font-size: 2rem;
  }

  .app-subtitle {
    font-size: 1rem;
  }

  .main-content {
    padding: 20px 15px;
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .app-title {
    font-size: 1.75rem;
  }

  .app-subtitle {
    font-size: 0.9rem;
  }

  .header-nav {
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  .nav-link {
    text-align: center;
    padding: 10px;
  }

  .main-content {
    padding: 15px 10px;
    gap: 15px;
  }
}
</style>
