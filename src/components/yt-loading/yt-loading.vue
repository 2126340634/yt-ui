<script setup lang="ts">
  import { computed, CSSProperties } from 'vue'
  import { ThemeColor } from '../../types/theme-types'

  interface Props {
    theme?: ThemeColor | 'none'
    visible?: boolean
    zIndex?: number
  }
  const props = withDefaults(defineProps<Props>(), {
    theme: 'classic',
    visible: true,
    zIndex: 1000
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
  const loadingStyle = computed(() => {
    return {
      zIndex: props.zIndex
    } as CSSProperties
  })

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
</template>

<style lang="scss" scoped>
  @use '../../styles/themes';
  @use '../../styles/components/loading';
</style>
