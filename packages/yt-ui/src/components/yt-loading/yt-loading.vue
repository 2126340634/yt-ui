<script setup lang="ts">
  import { computed } from 'vue'
  import { ThemeColor } from '../../types/theme-types'

  interface Props {
    theme?: ThemeColor | 'none'
    visible?: boolean
    textColor?: string
    zIndex?: number
    overlay?: boolean
    bgColor?: string
    duration?: number
  }
  const props = withDefaults(defineProps<Props>(), {
    theme: 'classic',
    visible: true,
    textColor: '#999',
    zIndex: 1000,
    overlay: false,
    bgColor: '#ffffff80',
    duration: 200
  })

  const loadingClass = computed(() => {
    return [
      'yt-loading',
      `yt-loading--theme-${props.theme}`,
      {
        'yt-loading--visible': props.visible
      }
    ]
  })
  const loadingStyle = computed(() => ({
    '--loading-z-index': props.zIndex,
    '--loading-text-color': props.textColor
  }))

  defineOptions({
    name: 'YtLoading'
  })
</script>

<template>
  <view
    :class="loadingClass"
    :style="loadingStyle"
  >
    <view class="yt-loading--inner-circle" />
    <span class="yt-loading--text">
      <slot />
    </span>
  </view>
  <yt-overlay
    v-if="overlay"
    class="yt-loading--overlay"
    :visible="visible"
    :bgColor="bgColor"
    :zIndex="zIndex - 1"
    :duration="duration"
  />
</template>

<style lang="scss" scoped>
  @use '../../styles/themes';
  @use '../../styles/components/loading';
</style>
