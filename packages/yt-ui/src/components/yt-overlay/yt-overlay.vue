<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    visible?: boolean
    duration?: number
    zIndex?: number
    bgColor?: string
    width?: number | string
    height?: number | string
  }
  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    duration: 200,
    zIndex: 500,
    bgColor: '#00000080',
    width: '100%',
    height: '100%'
  })

  const emit = defineEmits<{
    click: [e: Event]
  }>()

  const overlayStyle = computed(() => {
    return {
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      height: typeof props.height === 'number' ? `${props.height}px` : props.height,
      '--overlay-background-color': props.bgColor,
      '--overlay-transition': `opacity ${props.duration}ms ease-out, visibility ${props.duration}ms linear`,
      '--overlay-z-index': props.zIndex
    }
  })
  const overlayClass = computed(() => ({
    'yt-overlay': true,
    'yt-overlay--visible': props.visible
  }))

  function handleClick(e: Event) {
    emit('click', e)
  }

  defineOptions({
    name: 'YtOverlay'
  })
</script>

<template>
  <view
    @click="handleClick"
    :class="overlayClass"
    :style="overlayStyle"
    @touchmove.stop
  />
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_overlay.scss';
</style>
