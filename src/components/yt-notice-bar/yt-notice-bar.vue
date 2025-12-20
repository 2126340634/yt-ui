<script setup lang="ts">
  import { computed, useSlots } from 'vue'
  import { ThemeColor } from '../../types/theme-types'

  const slots = useSlots()

  interface Props {
    theme?: ThemeColor | 'none'
    width?: number | string
    height?: number | string
    textSize?: number
    animation?: boolean
    duration?: number
    prefixFlex?: number // 0-1
    suffixFlex?: number // 0-1
  }

  const props = withDefaults(defineProps<Props>(), {
    theme: 'none',
    width: '100%',
    height: 45,
    textSize: 12,
    animation: true,
    duration: 12000,
    prefixFlex: 0.3,
    suffixFlex: 0.3
  })

  const noticeBarClass = computed(() => {
    return ['yt-notice-bar', `yt-notice-bar--theme-${props.theme}`]
  })
  const noticeBarStyle = computed(() => {
    return {
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      height: typeof props.height === 'number' ? `${props.height}px` : props.height
    }
  })
  const noticeTextStyle = computed(() => {
    return {
      fontSize: `${props.textSize}px`,
      animationPlayState: props.animation ? 'running' : 'paused',
      animationDuration: `${props.duration}ms`
    }
  })

  const hasSlots = computed(() => {
    return {
      hasPrefix: !!slots.prefix,
      hasSuffix: !!slots.suffix
    }
  })

  defineOptions({
    name: 'YtNoticeBar'
  })
</script>

<template>
  <view
    :class="noticeBarClass"
    :style="noticeBarStyle"
  >
    <view
      v-if="hasSlots.hasPrefix"
      class="yt-notice-bar--prefix"
      :style="{ flex: prefixFlex }"
    >
      <slot name="prefix" />
    </view>
    <view class="yt-notice-bar--text-container">
      <span
        class="yt-notice-bar--text"
        :style="noticeTextStyle"
      >
        <slot />
      </span>
    </view>
    <view
      v-if="hasSlots.hasSuffix"
      class="yt-notice-bar--suffix"
      :style="{ flex: suffixFlex }"
    >
      <slot name="suffix" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_notice-bar.scss';
  @use '../../styles/themes';
</style>
