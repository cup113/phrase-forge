# Phrase-Forge / 语匠

## 一、项目背景

英语学习者在词汇积累后，常面临"无法灵活运用"的瓶颈。传统学习工具缺乏对句子使用的即时反馈，导致用户难以发现语法错误、用词不当或表达僵化的问题。本项目通过结合AI评分与修改建议功能，为用户提供针对性练习场景，提升英语写作能力。

## 二、核心功能

1. **用户输入模块**
   - 用户输入目标单词、造句及作文应用场景
   - 支持多设备适配，界面简洁直观
2. **AI 评分接口**
   - 已设计完毕的 AI 工作流
   - 提供词汇使用建议与优化
   - 句子评分系统（A+/A/B+/B/C+/C）
3. **实时修改建议**
   - 提出错误并提供修改建议
   - 生成优化后的参考造句
4. **多任务处理机制**
   - 用户在等待AI反馈时可继续提交新句子，系统异步处理任务队列
5. **学习进度跟踪**
   - 记录用户的学习历史和进步情况
6. **历史记录查看**
   - 支持查看过往的造句练习记录

## 三、技术选型

**纯前端架构**

Vue 3 + TypeScript + Vite + Pinia + Vue-Router

BYOK（Bring Your Own API-Key）模式，防止个人 API Key 泄露与成本增加

异步请求池也由前端进行

## 四、详细需求参数

### 工作流 API 请求

- API Endpoint: `https://dashscope.aliyuncs.com/api/v1/apps/c64617ac89584dafaaa72de357e3c184/completion`
- Headers:
  - Authorization: Bearer YOUR_API_KEY
  - Content-Type: application/json
- Body:
  ```json
  {
    "parameters": {
      "keyword": "关键词",
      "sentence": "学生造句",
      "scenario": "应用场景"
    }
  }
  ```

返回参数：

非流式。

```json
{
  "output": {
    "level": "A+/A/B+/B/C+/C",
    "reason": "评分理由",
    "suggestions": ["English||Chinese", "English||Chinese"],
    "explanation": "建议解释，注意若等第为 A+，则无 suggestions 和 explanation 字段。"
  },
  "request_id": "a00234-...",
  "usage": {
    "input_tokens": 100,
    "output_tokens": 1000,
    "total_tokens": 1100
  }
}
```

## 六、技术实现细节

### 组件架构

- App.vue - 应用根组件
- ApiConfig.vue - API 配置组件
- InputForm.vue - 输入表单组件
- TaskQueue.vue - 任务队列组件
- ResultDisplay.vue - 结果展示组件
- HistoryView.vue - 历史记录组件
- Settings.vue - 设置组件

### 状态管理结构

- useApiStore - API 配置管理
- useTaskStore - 任务队列管理
- useHistoryStore - 历史记录管理
- useSettingsStore - 应用设置管理

## 七、开发规范

- 使用 TypeScript 严格模式
- 遵循 Vue 3 Composition API 最佳实践
- 组件采用 `<script setup>` 语法
- 状态管理使用 Pinia
- 响应式设计优先考虑桌面端体验
- 代码风格遵循 ESLint + Prettier 配置
