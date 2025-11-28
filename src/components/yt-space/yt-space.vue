<script setup lang="ts">
  import { computed, useSlots } from 'vue'

  interface Props {
    align: 'start' | 'center' | 'end' | 'baseline'
    breakLine: boolean
    direction: 'horizontal' | 'vertical'
    separator: boolean
    size: number | string
  }

  const slots = useSlots()
  const defaultSlot = computed(() => {
    if (!slots.default) return []
    return slots.default().filter(vnode => vnode.type !== Comment && vnode.type !== Text)
  })

  const props = withDefaults(defineProps<Props>(), {
    align: 'center',
    breakLine: false,
    direction: 'horizontal',
    separator: false,
    size: 16
  })

  const spaceStyle = computed(() => {
    return {
      'align-items': props.align,
      gap: typeof props.size === 'number' ? `${props.size}px` : props.size
    }
  })

  const spaceClass = computed(() => {
    return [
      'yt-space',
      `yt-space--${props.direction}`,
      `yt-space--${props.breakLine ? 'wrap' : 'nowrap'}`
    ]
  })

  const separatorStyle = computed(() => {
    const isHorizontal = props.direction === 'horizontal'
    return {
      width: isHorizontal ? '0.5px' : '16px',
      height: isHorizontal ? '16px' : '0.5px'
    }
  })

  const separatorContainerStyle = computed(() => {
    return {
      '--separator-container-direction': props.direction === 'horizontal' ? 'row' : 'column',
      '--separator-container-gap': typeof props.size === 'number' ? `${props.size}px` : props.size
    }
  })

  defineOptions({
    name: 'YtSpace'
  })
</script>

<template>
  <view
    :class="spaceClass"
    :style="spaceStyle"
  >
    <view
      v-for="(item, index) in defaultSlot"
      :key="index"
      class="yt-space--separator-container"
      :style="separatorContainerStyle"
    >
      <component :is="item" />
      <view
        v-if="props.separator && index < defaultSlot.length - 1"
        class="yt-space--separator"
        :style="separatorStyle"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_space.scss';
</style>
