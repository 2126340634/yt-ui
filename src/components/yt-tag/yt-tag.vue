<script setup lang="ts">
  import { computed } from 'vue'
  import { ThemeColor } from '../../types/theme-types'
  import { ColorType, SizeType } from '../../types/prop-types'

  interface Props {
    theme?: ThemeColor
    type?: ColorType
    size?: SizeType
    plain?: boolean
    borderRadius?: number | string
    disabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    theme: 'classic',
    type: 'primary',
    size: 'medium',
    plain: false,
    borderRadius: 20,
    disabled: false
  })

  const emit = defineEmits<{
    click: [e: Event]
  }>()

  const tagClass = computed(() => {
    return [
      'yt-tag',
      `yt-tag--${props.type}${props.theme && props.type === 'primary' ? `-${props.theme}` : ''}`,
      `yt-tag--${props.size}`,
      {
        'yt-tag--plain': props.plain,
        'yt-tag--disabled': props.disabled
      }
    ]
  })
  const tagStyle = computed(() => {
    return {
      borderRadius:
        typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius
    }
  })

  function handleClick(e: Event) {
    emit('click', e)
  }

  defineOptions({
    name: 'YtTag'
  })
</script>

<template>
  <view
    :class="tagClass"
    :style="tagStyle"
    @click="handleClick"
  >
    <slot />
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_tag.scss';
  @use '../../styles/_themes.scss';
</style>
