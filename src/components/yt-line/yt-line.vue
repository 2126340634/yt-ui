<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    type?: 'primary' | 'success' | 'warning' | 'error' | 'info'
    size?: number | string
    disabled?: boolean
    underline?: boolean
    padStart?: number | string
    padEnd?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'primary',
    size: 16,
    disabled: false,
    underline: true,
    padStart: 0,
    padEnd: 0
  })

  const emit = defineEmits<{
    click: [e: any]
  }>()

  const lineClass = computed(() => {
    return [
      'yt-line',
      `yt-line--${props.type}${props.underline ? '--underline' : ''}`,
      {
        'yt-line--disabled': props.disabled
      }
    ]
  })

  const lineStyle = computed(() => {
    return {
      fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
      marginLeft: typeof props.padStart === 'number' ? `${props.padStart}px` : props.padStart,
      marginRight: typeof props.padEnd === 'number' ? `${props.padEnd}px` : props.padEnd
    }
  })

  const handleClick = (e: any) => {
    if (!props.disabled) {
      emit('click', e)
    }
  }

  defineOptions({
    name: 'YtLine'
  })
</script>

<template>
  <view class="yt-line--container">
    <slot name="prefix" />
    <span
      @click="handleClick"
      :class="lineClass"
      :style="lineStyle"
    >
      <slot />
    </span>
    <slot name="suffix" />
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_line.scss';
</style>
