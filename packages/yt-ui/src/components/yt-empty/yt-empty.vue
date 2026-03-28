<script setup lang="ts">
  interface Props {
    type?: 'fail' | 'empty' | 'done' | 'champion' | 'error'
    size?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'empty',
    size: 24
  })

  const typeMap = {
    fail: 'Fail',
    empty: 'Empty',
    done: 'Done',
    champion: 'Champion',
    error: 'Error'
  }

  defineOptions({
    name: 'YtEmpty'
  })
</script>

<template>
  <view class="yt-empty">
    <yt-icon
      :name="typeMap[props.type]"
      :size="size"
      :width="200"
      :height="200"
    />
  </view>
</template>

<style lang="scss" scoped>
  .yt-empty {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
