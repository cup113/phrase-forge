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

- **任务队列** - 异步处理，支持多任务同时提交
- **历史记录** - 完整的学习历程追踪
- **进度统计** - 学习成果可视化展示
- **数据导出** - 支持学习记录导出备份

### 🎨 用户体验

- **响应式设计** - 完美适配桌面端和移动端
- **直观界面** - 简洁优雅的现代化设计
- **实时状态** - 任务处理进度实时显示
- **离线存储** - 本地数据持久化

## 🛠️ 技术架构

### 前端技术栈

- **Vue 3** - 现代化前端框架
- **TypeScript** - 类型安全的开发体验
- **Vite** - 快速的构建工具
- **Pinia** - 轻量级状态管理
- **Vue Router** - 单页面应用路由

### 架构特色

- **纯前端架构** - 无需后端服务器
- **BYOK模式** - Bring Your Own API-Key，保护用户隐私
- **异步任务处理** - 智能任务队列管理
- **本地存储** - 数据持久化到浏览器

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

# 构建生产版本
pnpm build

# 类型检查
pnpm type-check

# 代码格式化
pnpm format

# 代码检查
pnpm lint
```

### API 配置

1. 访问应用首页
2. 点击"设置"进入配置页面
3. 输入您的 API Key 和端点地址
4. 保存配置后即可开始使用

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ApiConfig.vue   # API配置组件
│   ├── DataManager.vue # 数据管理组件
│   ├── GlobalError.vue # 全局错误处理
│   ├── InputForm.vue   # 输入表单组件
│   ├── LoadingSpinner.vue # 加载动画
│   ├── ProgressStats.vue # 进度统计
│   └── TaskQueue.vue   # 任务队列组件
├── router/             # 路由配置
│   └── index.ts
├── services/           # 业务服务
│   ├── apiService.ts  # API服务
│   └── taskProcessor.ts # 任务处理器
├── stores/            # 状态管理
│   ├── apiConfig.ts   # API配置状态
│   ├── counter.ts     # 示例状态
│   ├── history.ts     # 历史记录状态
│   └── taskQueue.ts   # 任务队列状态
├── views/             # 页面视图
│   ├── History.vue    # 历史记录页面
│   ├── Home.vue       # 首页
│   └── Settings.vue   # 设置页面
├── App.vue            # 应用根组件
└── main.ts           # 应用入口
```

## 🔧 开发规范

### 代码风格

- **TypeScript** - 严格类型检查模式
- **Vue 3** - Composition API + `<script setup>` 语法
- **ESLint** + **Prettier** - 统一的代码格式化
- **组件化** - 单一职责，高内聚低耦合

### 命名约定

- **camelCase** - 变量、函数、方法
- **PascalCase** - 组件、类型、接口
- **kebab-case** - 文件命名、CSS类名

### 状态管理

- 使用 Pinia 进行全局状态管理
- 遵循单向数据流原则
- 状态持久化到 localStorage

## 📝 API 接口

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
  "explanation": "建议解释"
}
```

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
