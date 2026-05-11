<script setup lang="ts">
import { scheduleData, timeList } from '@/configs/testConfig'
</script>

<template>
  <yt-schedule :timeList="timeList" :data="scheduleData"></yt-schedule>
</template>

<style lang="scss" scoped></style>
