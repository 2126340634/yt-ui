# yt-ui

A simple, lightweight UI library for [指尖移通 5.0 微信小程序] with Vue 3 + TypeScript.

## ✨ Features

- Zero import via easycom
- Written in Vue 3 `<script setup>` + TypeScript
- Supports WeChat MiniProgram, Uni-app, etc.

## 📦 Install

```bash
npm install @rao2126340634/yt-ui
# or
pnpm add @rao2126340634/yt-ui
```

## ⚙️ Usage

Configure [pages.json]:

````json
{
  "easycom": {
    "custom": {
        "autoscan": true,
        "^yt-(.*)": "@rao2126340634/yt-ui/src/components/yt-$1/yt-$1.vue"
    }
  }
}

Use in any page:

```vue
<template>
  <yt-button>Click me</yt-button>
</template>
````

## 📄 License

MIT © [CHEEMS|https://github.com/2126340634]
