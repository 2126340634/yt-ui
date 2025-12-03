<script setup lang="ts">
  import { computed, useSlots } from 'vue'

  interface Props {
    direction?: 'horizontal' | 'vertical'
    height?: number | string
    width?: number | string
    align?: 'left' | 'center' | 'right' | 'start' | 'end'
    type?: 'solid' | 'dashed' | 'dotted'
    margin?: number | string
    lineColor?: string
    textColor?: string
    textSize?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    direction: 'horizontal',
    height: 240,
    width: '100%',
    align: 'center',
    type: 'solid',
    margin: '32px',
    lineColor: '#DCDFE6',
    textColor: '#3e3e3e60',
    textSize: 16
  })

  const hasContent = computed(() => {
    return useSlots().default
  })
  const isHorizontal = computed(() => {
    return props.direction === 'horizontal'
  })
  const containerHeight = computed(() => {
    return isHorizontal.value
      ? 'fit-content'
      : typeof props.height === 'number'
      ? `${props.height}px`
      : props.height
  })
  const containerWidth = computed(() => {
    return isHorizontal.value
      ? typeof props.width === 'number'
        ? `${props.width}px`
        : props.width
      : 'fit-content'
  })
  const dividerContainerStyle = computed(() => {
    return {
      height: containerHeight.value,
      width: containerWidth.value,
      '--divider-direction': isHorizontal.value ? 'row' : 'column'
    }
  })
  const dividerClass = computed(() => {
    return ['yt-divider', `yt-divider--${props.direction}`, `yt-divider--${props.align}`]
  })
  const dividerStyle = computed(() => {
    if (props.type !== 'solid') {
      return {
        borderColor: props.lineColor,
        borderWidth: isHorizontal.value ? '1px 0 0 0' : '0 0 0 1px',
        borderStyle: props.type,
        '--divider-margin': typeof props.margin === 'number' ? `${props.margin}px` : props.margin,
        width: isHorizontal.value ? '100%' : '1px',
        height: isHorizontal.value ? '1px' : '100%'
      }
    } else {
      return {
        backgroundColor: props.lineColor,
        [isHorizontal.value ? 'height' : 'width']: '1px',
        '--divider-margin': typeof props.margin === 'number' ? `${props.margin}px` : props.margin,
        width: isHorizontal.value ? '100%' : '1px',
        height: isHorizontal.value ? '1px' : '100%'
      }
    }
  })
  const singleDividerStyle = computed(() => {
    return {
      ...dividerContainerStyle.value,
      ...dividerStyle.value
    }
  })
  const textStyle = computed(() => {
    return {
      textAlign: props.align,
      color: props.textColor,
      fontSize: typeof props.textSize === 'number' ? `${props.textSize}px` : props.textSize
    }
  })

  defineOptions({
    name: 'YtDivider'
  })
</script>

<template>
  <view
    v-if="hasContent"
    class="yt-divider--container"
    :style="dividerContainerStyle"
  >
    <view
      :class="[...dividerClass, 'start-line']"
      :style="dividerStyle"
    />
    <span :style="textStyle">
      <slot />
    </span>
    <view
      :class="[...dividerClass, 'end-line']"
      :style="dividerStyle"
    />
  </view>
  <view
    v-else
    :class="[...dividerClass, 'single-line']"
    :style="singleDividerStyle"
  />
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_divider.scss';
</style>
