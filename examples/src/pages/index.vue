<script setup lang="ts">
const navigateTo = (path: string) => {
  uni.navigateTo({ url: path })
}
</script>

<template>
  <view style="display: flex; gap: 8px; padding: 16px; margin: 0 auto; width: fit-content">
    <yt-button theme="forest" @click="navigateTo('/pages/schedule')">课程表</yt-button>
    <yt-button theme="forest" @click="navigateTo('/pages/virtual-list')">虚拟列表</yt-button>
  </view>
</template>

<style lang="scss" scoped></style>
