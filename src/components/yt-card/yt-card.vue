<script setup lang="ts">
  import { computed, useSlots } from 'vue'
  import { ThemeColor } from '../../types/theme-types'
  interface Props {
    theme?: ThemeColor
    width?: number | string
    height?: number | string
    borderRadius?: number | string
    borderColor?: string
    shadow?: string
    padding?: number | string
    margin?: number | string
    spacing?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    theme: 'classic',
    width: '100%',
    height: 200,
    borderRadius: 10,
    borderColor: '#eee',
    shadow: '0 1px 4px rgba(0, 0, 0, 0.25)',
    padding: 8,
    margin: 8,
    spacing: 8
  })

  const hasHeader = computed(() => {
    return !!useSlots().header
  })

  const emit = defineEmits<{
    click: [e: Event]
  }>()

  const spacing = computed(() => {
    return typeof props.spacing === 'number' ? `${props.spacing}px` : props.spacing
  })
  const cardClass = computed(() => {
    return ['yt-card', `yt-card--theme-${props.theme}`]
  })
  const cardStyle = computed(() => {
    return {
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      height: typeof props.height === 'number' ? `${props.height}px` : props.height,
      borderRadius:
        typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius,
      borderColor: props.borderColor,
      boxShadow: props.shadow,
      padding: typeof props.padding === 'number' ? `${props.padding}px` : props.padding,
      margin: typeof props.margin === 'number' ? `${props.margin}px` : props.margin
    }
  })

  function handleClick(e: Event) {
    emit('click', e)
  }

  defineOptions({
    name: 'YtCard'
  })
</script>

<template>
  <view
    @click="handleClick"
    :class="cardClass"
    :style="cardStyle"
  >
    <!-- header -->
    <view
      class="yt-card--header"
      v-if="hasHeader"
    >
      <slot name="header" />
    </view>
    <!-- divider -->
    <yt-divider
      v-if="hasHeader"
      :margin="spacing"
    />
    <!-- body -->
    <view class="yt-card--body">
      <slot />
    </view>
    <span class="yt-card--decoration">|</span>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_card.scss';
  @use '../../styles/themes';
</style>
