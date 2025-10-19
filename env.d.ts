/// <reference types="vite/client" />

// Vue SFC 模块声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

// 路径别名声明
declare module '@/*' {
  const value: unknown
  export default value
}
