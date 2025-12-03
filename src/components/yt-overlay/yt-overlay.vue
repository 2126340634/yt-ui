<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    visible: boolean
    duration: number
    zIndex: number
    bgColor: string
  }
  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    duration: 200,
    zIndex: 500,
    bgColor: '#00000080'
  })

  const emit = defineEmits<{
    click: [e: Event]
  }>()

  const overlayStyle = computed(() => {
    return {
      backgroundColor: props.bgColor,
      transition: `opacity ${props.duration}ms ease-out, visibility ${props.duration}ms linear`,
      zIndex: props.zIndex
    }
  })
  const overlayClass = computed(() => {
    return [
      'yt-overlay',
      {
        'yt-overlay--visible': props.visible
      }
    ]
  })

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
  />
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_overlay.scss';
</style>
