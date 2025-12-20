<script setup lang="ts">
  interface Props {
    type?: 'success' | 'fail' | 'info'
    size?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'success',
    size: 24
  })

  const typeMap = {
    success: 'SuccessResult',
    fail: 'FailResult',
    info: 'InfoResult'
  }

  defineOptions({
    name: 'YtResult'
  })
</script>

<template>
  <view class="yt-result">
    <yt-icon
      :name="typeMap[props.type]"
      :size="size"
      :width="120"
      :height="120"
    />
    <span class="yt-result--text"><slot /></span>
  </view>
</template>

<style lang="scss" scoped>
  .yt-result {
    width: fit-content;
    height: fit-content;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: inline-flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;

    &--text {
      color: #999;
    }
  }
</style>
