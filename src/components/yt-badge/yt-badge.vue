<script setup lang="ts">
  import { computed } from 'vue'
  import { ThemeColor } from '../../types/theme-types'

  interface Props {
    theme?: ThemeColor
    count?: number
    overflowCount?: number
    dot?: boolean
    offset?: number[]
    zIndex?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    theme: 'classic',
    count: 0,
    overflowCount: 99,
    dot: false,
    offset: () => [],
    zIndex: 100
  })

  const badgeClass = computed(() => {
    return [
      'yt-badge',
      `yt-badge--theme-${props.theme}`,
      {
        'yt-badge--dot': props.dot,
        'yt-badge--count': !props.dot,
        'yt-badge--visible': (!props.dot && props.count) || props.dot
      }
    ]
  })

  const badgeStyle = computed(() => {
    return {
      zIndex: props.zIndex,
      left: `${props.offset[0]}px` || 0,
      top: `${props.offset[1]}px` || 0
    }
  })

  const visibleCount = computed(() => {
    return props.count > props.overflowCount ? `${props.overflowCount}+` : props.count
  })
</script>

<template>
  <view
    :class="badgeClass"
    :style="badgeStyle"
  >
    <span
      class="yt-badge--count-text"
      v-if="!props.dot"
    >
      {{ visibleCount }}
    </span>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/badge';
  @use '../../styles/themes';
</style>
