<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    type?: 'primary' | 'success' | 'warning' | 'error' | 'info'
    size?: 'small' | 'medium' | 'large'
    plain?: boolean
    disabled?: boolean
    loading?: boolean
    circle?: boolean
    stretch?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'primary',
    size: 'medium',
    plain: false,
    disabled: false,
    loading: false,
    circle: false,
    stretch: false
  })

  const emit = defineEmits<{
    click: [e: Event]
  }>()

  const buttonClass = computed(() => {
    return [
      'yt-button',
      `yt-button--${props.type}`,
      `yt-button--${props.size}`,
      {
        'yt-button--plain': props.plain,
        'yt-button--disabled': props.disabled || props.loading,
        'yt-button--loading': props.loading,
        'yt-button--circle': props.circle,
        'yt-button--stretch': props.stretch
      }
    ]
  })

  function handleClick(e: Event) {
    if (!props.disabled && !props.loading) {
      emit('click', e)
    }
  }

  defineOptions({
    name: 'YtButton'
  })
</script>

<template>
  <button
    :class="buttonClass"
    :loading="loading"
    hover-class="yt-button--hover"
    @click="handleClick"
  >
    <span
      v-if="loading"
      class="yt-button--loading"
    ></span>
    <span class="yt-button--text">
      <slot></slot>
    </span>
    <view class="yt-button--overlay" />
  </button>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_button.scss';
</style>
