<script setup lang="ts">
  import { computed, useSlots } from 'vue'
  import { AlignType } from '../../types/prop-types'

  interface Props {
    direction?: 'horizontal' | 'vertical'
    align?: AlignType
    type?: 'solid' | 'dashed' | 'dotted'
    margin?: number | string
    lineColor?: string
    textColor?: string
    textSize?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    direction: 'horizontal',
    align: 'center',
    type: 'solid',
    margin: 32,
    lineColor: '#DCDFE6',
    textColor: '#3e3e3e60',
    textSize: 16
  })

  const hasContent = computed(() => {
    return !!useSlots().default
  })
  const isHorizontal = computed(() => {
    return props.direction === 'horizontal'
  })
  const dividerContainerStyle = computed(() => {
    return {
      height: isHorizontal.value ? 'fit-content' : '100%',
      width: isHorizontal.value ? '100%' : 'fit-content',
      '--divider-direction': isHorizontal.value ? 'row' : 'column'
    }
  })
  const dividerClass = computed(() => {
    return ['yt-divider', `yt-divider--${props.direction}`, `yt-divider--${props.align}`]
  })
  const dividerStyle = computed(() => {
    const width = isHorizontal.value ? '100%' : '1px'
    const height = isHorizontal.value ? '1px' : '100%'
    const margin = typeof props.margin === 'number' ? `${props.margin}px` : props.margin
    if (props.type !== 'solid') {
      return {
        borderColor: props.lineColor,
        borderWidth: isHorizontal.value ? '1px 0 0 0' : '0 0 0 1px',
        borderStyle: props.type,
        '--divider-margin': margin,
        width,
        height
      }
    } else {
      return {
        backgroundColor: props.lineColor,
        [isHorizontal.value ? 'height' : 'width']: '1px',
        '--divider-margin': margin,
        width,
        height
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
