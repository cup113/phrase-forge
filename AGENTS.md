# 智能体开发指南

## 项目概述

**Phrase-Forge / 语匠** - 英语写作智能辅助工具

### 项目背景

英语学习者在词汇积累后，常面临"无法灵活运用"的瓶颈。传统学习工具缺乏对句子使用的即时反馈，导致用户难以发现语法错误、用词不当或表达僵化的问题。本项目通过结合AI评分与修改建议功能，为用户提供针对性练习场景，提升英语写作能力。

### 核心功能

1. **用户输入模块** - 用户输入目标单词、造句及作文应用场景
2. **AI 评分接口** - 已设计完毕的 AI 工作流
3. **实时修改建议** - 提出错误并提供修改建议，生成优化后的参考造句
4. **多任务处理机制** - 用户在等待AI反馈时可继续提交新句子，系统异步处理任务队列

### 技术架构

**纯前端架构** - Vue 3 + TypeScript + Vite + Pinia + Vue-Router
**BYOK模式** - Bring Your Own API-Key，防止个人 API Key 泄露与成本增加

## 构建/检查/测试命令

**重要提醒：本项目使用 pnpm 作为包管理器，请勿使用 npm！**

- `pnpm dev` - 启动开发服务器（不要主动调用这行命令）
- `pnpm build` - 构建项目（包含类型检查）
- `pnpm build-only` - 仅构建项目（不进行类型检查）
- `pnpm type-check` - 运行 TypeScript 类型检查
- `pnpm lint` - 运行 ESLint 并自动修复
- `pnpm format` - 使用 Prettier 格式化代码

## 代码风格指南

- **TypeScript**: 严格类型检查，使用 Vue 3 Composition API
- **导入顺序**: ES 模块，Vue 导入优先，然后是外部库
- **格式化**: Prettier 配置，100字符宽度，无分号，单引号
- **命名规范**:
  - camelCase 用于变量/函数
  - PascalCase 用于组件/类型
- **Vue**: 使用 `<script setup>` 语法，Composition API 配合 Pinia 状态管理
- **错误处理**: 使用 TypeScript 进行编译时错误预防
- **文件结构**: Vue 单文件组件，包含 template/script/style 部分

## 测试

- 尚未配置测试框架 - 可添加 Vitest/Jest 进行单元测试
- 构建前运行类型检查: `pnpm type-check`

## 开发工具

- ESLint + Prettier 用于代码质量
- Vue 3 + TypeScript + Vite 技术栈
- Pinia 用于状态管理
