根据您提供的英文文档和链接信息，我已将其翻译并整合为中文版本文档，并针对链接中可能涉及的“UniApp Workspaces 编译报错”问题，提供了通用的排查和解决方案。

---

### yt-ui

一套为“zjyt 5.0”设计的简单、轻量的 UI 组件库，基于 Vue 3 + uni-app + TypeScript 构建。

## ✨ 特性

- 支持 easycom 零引入，自动按需加载
- 基于 Vue 3 `<script setup>` + TypeScript 编写
- 支持微信小程序、Uni-app 等多端平台

## 📦 安装

```bash
npm install @rao2126340634/yt-ui
# 或使用 pnpm
pnpm add @rao2126340634/yt-ui
```

## ⚙️ 使用方法

在 `pages.json` 中配置 easycom：

```json
{
  "easycom": {
    "custom": {
      "autoscan": true,
      "^yt-(.*)": "@rao2126340634/yt-ui/src/components/yt-$1/yt-$1.vue"
    }
  }
}
```

在页面中直接使用组件：

```vue
<template>
  <yt-button>点我</yt-button>
</template>
```

## ❓ 运行 examples 报错问题

UniApp Workspaces 编译报错：Invalid pattern ... for "output.chunkFileNames", patterns can be neither absolute nor relative paths. If you want your files to be stored in a subdirectory, write its name without a leading slash like this: subdirectory/pattern.

解决方案请看[这篇文章](https://juejin.cn/post/7581844141668483112)。
