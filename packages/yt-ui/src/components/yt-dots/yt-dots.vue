<script setup lang="ts">
  import { computed } from 'vue'
  import { ThemeColor } from '../../types/theme-types'

  interface Props {
    total: number
    activeIndex?: number
    theme?: ThemeColor | 'none'
    size?: number
    direction?: 'horizontal' | 'vertical'
  }

  const props = withDefaults(defineProps<Props>(), {
    total: 1,
    activeIndex: 0,
    theme: 'none',
    size: 24,
    direction: 'horizontal'
  })

  const isHorizontal = computed(() => {
    return props.direction === 'horizontal'
  })

  const dotsStyle = computed(() => {
    return {
      transform: `scale(${props.size / 24})`,
      '--dots-flex-direction': isHorizontal.value ? 'row' : 'column'
    }
  })
  const dotsClass = computed(() => {
    return ['yt-dots', `yt-dots--theme-${props.theme}`, `yt-dots--${props.direction}`]
  })

  function getDotsItemOuterClass(index: number) {
    const total = props.total
    const activeIndex = props.activeIndex
    const overLastDot = index === total - 1 && activeIndex > total - 1
    const isCurrentActive = index === activeIndex || overLastDot
    return [
      'yt-dots--item-outer',
      {
        'yt-dots--item-outer-active': isCurrentActive
      }
    ]
  }
  function getDotsItemInnerStyle(index: number) {
    const total = props.total
    const activeIndex = props.activeIndex
    const overLastDot = index === total - 1 && activeIndex > total - 1
    const opacity = overLastDot ? `${Math.max(0.2, 1 - (activeIndex - total + 1) * 0.2)}` : '1'
    return {
      opacity
    }
  }

  defineOptions({
    name: 'YtDots'
  })
</script>

<template>
  <view
    :class="dotsClass"
    :style="dotsStyle"
  >
    <view
      v-for="(_, index) in total"
      :key="index"
      :class="getDotsItemOuterClass(index)"
    >
      <view
        class="yt-dots--item-inner"
        :style="getDotsItemInnerStyle(index)"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_dots.scss';
  @use '../../styles/_themes.scss';
</style>
