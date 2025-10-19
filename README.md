# Phrase-Forge / 语匠

> 英语写作智能辅助工具 - 提升英语写作能力，从词汇到句子的完美运用

## 🎯 项目简介

**语匠 (Phrase Forge)** 是一款专为英语学习者设计的智能写作辅助工具。针对英语学习者在词汇积累后"无法灵活运用"的瓶颈问题，通过AI评分与实时修改建议，为用户提供针对性的练习场景，有效提升英语写作能力。

## ✨ 核心功能

### 🚀 智能写作评估

- **关键词练习** - 针对特定词汇进行造句练习
- **AI评分系统** - 六级评分体系（A+/A/B+/B/C+/C）
- **实时反馈** - 即时获得语法、用词、表达方式的专业建议
- **场景化练习** - 支持自定义应用场景，提升实际运用能力

### 📊 学习管理

- **异步任务队列** - 智能任务处理，支持多任务同时提交
- **实时状态监控** - 任务处理进度实时显示
- **历史记录追踪** - 完整的学习历程管理
- **数据导出备份** - 支持学习记录导出为JSON格式

### 🎨 用户体验

- **响应式设计** - 完美适配桌面端和移动端
- **现代化界面** - 简洁优雅的玻璃拟态设计
- **本地数据持久化** - 使用 localStorage 保存所有数据
- **全局错误处理** - 完善的错误提示和重试机制

## 🛠️ 技术架构

### 前端技术栈

- **Vue 3** - 现代化前端框架，使用 Composition API
- **TypeScript** - 类型安全的开发体验
- **Vite** - 快速的构建工具和开发服务器
- **Pinia** - 轻量级状态管理
- **Vue Router** - 单页面应用路由
- **VueUse** - 实用的组合式函数库

### 架构特色

- **纯前端架构** - 无需后端服务器，完全在浏览器中运行
- **BYOK模式** - Bring Your Own API-Key，保护用户隐私和成本控制
- **异步任务处理** - 智能任务队列管理，支持并发处理
- **本地存储** - 所有数据持久化到浏览器 localStorage

## 🚀 快速开始

### 环境要求

- Node.js 20.19.0+ 或 22.12.0+
- pnpm 包管理器

### 安装与运行

```bash
# 克隆项目
git clone <repository-url>
cd phrase-forge

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本（包含类型检查）
pnpm build

# 仅构建项目（不进行类型检查）
pnpm build-only

# 运行 TypeScript 类型检查
pnpm type-check

# 代码格式化
pnpm format

# 代码检查并自动修复
pnpm lint
```

### API 配置

1. 访问应用首页
2. 点击导航栏进入"设置"页面
3. 输入您的 API Key 和端点地址
4. 保存配置后返回首页即可开始使用

## 📁 项目结构

```
src/
├── components/           # 可复用组件
│   ├── ApiConfig.vue    # API配置组件
│   ├── AppHeader.vue    # 应用头部组件
│   ├── DataManager.vue  # 数据管理组件
│   ├── GlobalError.vue  # 全局错误处理组件
│   ├── InputForm.vue    # 句子输入表单组件
│   ├── LoadingSpinner.vue # 加载动画组件
│   ├── ProgressStats.vue # 学习进度统计组件
│   ├── TaskItem.vue     # 任务项展示组件
│   └── TaskQueue.vue    # 任务队列管理组件
├── router/              # 路由配置
│   └── index.ts        # 路由定义
├── services/           # 业务服务层
│   ├── apiService.ts   # API调用服务
│   ├── taskProcessor.ts # 任务处理器
│   └── taskProcessor.types.ts # 任务处理类型定义
├── stores/            # 状态管理
│   ├── apiConfig.ts   # API配置状态管理
│   ├── counter.ts     # 示例状态（可移除）
│   ├── history.ts     # 历史记录状态管理
│   └── taskQueue.ts   # 任务队列状态管理
├── types/             # 类型定义
│   └── index.ts       # 统一的数据类型定义
├── views/             # 页面视图
│   ├── HistoryView.vue # 历史记录页面
│   ├── HomeView.vue   # 首页（主要功能页面）
│   └── SettingsView.vue # 设置页面
├── App.vue            # 应用根组件
└── main.ts           # 应用入口文件
```

## 🔧 核心实现

### 任务处理流程

1. **任务提交** - 用户通过 InputForm 组件提交关键词、句子和场景
2. **队列管理** - TaskQueueStore 管理任务状态（pending/processing/completed/failed）
3. **异步处理** - TaskProcessor 按顺序处理队列中的任务
4. **API调用** - ApiService 调用外部AI服务进行评估
5. **结果存储** - 完成的任务自动保存到历史记录

### 状态管理

使用 Pinia 进行全局状态管理，包含四个主要store：

- **taskQueueStore** - 管理任务队列和任务状态
- **historyStore** - 管理学习历史记录
- **apiConfigStore** - 管理API配置信息
- **counterStore** - 示例store（可移除）

### 数据持久化

所有用户数据使用 localStorage 持久化存储：
- 任务队列数据
- 历史记录数据  
- API配置信息
- 学习进度统计

## 📝 API 接口规范

### 请求格式

```json
{
  "input": {
    "prompt": "[任务]",
    "biz_params": {
      "keyword": "关键词",
      "sentence": "学生造句",
      "scenario": "应用场景"
    }
  },
  "parameters": {},
  "debug": {}
}
```

### 响应格式

```json
{
  "level": "A+/A/B+/B/C+/C",
  "reason": "评分理由",
  "suggestions": ["English||Chinese", "English||Chinese"],
  "explanation": "建议解释",
  "usage": {
    "inputTokens": 100,
    "outputTokens": 50,
    "modelId": "model-name"
  }
}
```

## 🔧 开发规范

### 代码风格

- **TypeScript** - 严格类型检查模式，使用 Vue 3 Composition API
- **Vue 3** - 使用 `<script setup>` 语法糖
- **ESLint + Prettier** - 统一的代码格式化规范
- **组件化开发** - 单一职责，高内聚低耦合

### 命名约定

- **camelCase** - 变量、函数、方法
- **PascalCase** - 组件、类型、接口
- **kebab-case** - 文件命名、CSS类名

### 导入顺序

1. Vue 相关导入
2. 外部库导入
3. 项目内部模块导入
4. 类型导入

## 🎯 使用指南

### 基本使用流程

1. **配置API** - 在设置页面输入您的API Key和端点地址
2. **提交句子** - 在首页输入关键词、造句和应用场景
3. **查看结果** - 在任务队列中实时查看处理进度和结果
4. **管理历史** - 在历史页面查看学习记录和统计数据

### 功能特性

- **多任务支持** - 可同时提交多个句子进行评估
- **实时进度** - 任务处理状态实时更新
- **错误重试** - 网络错误时自动重试机制
- **数据导出** - 支持历史记录导出为JSON文件
- **响应式设计** - 完美支持移动端和桌面端

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**语匠 - 让英语写作变得更简单、更高效！**