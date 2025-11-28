<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    content?: string
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
    content: '',
    direction: 'horizontal',
    height: 80,
    width: '100%',
    align: 'center',
    type: 'solid',
    margin: '32px',
    lineColor: '#DCDFE6',
    textColor: '#3e3e3e60',
    textSize: 16
  })

  const dividerContainerStyle = computed(() => {
    const isHorizontal = props.direction === 'horizontal'
    return {
      height: isHorizontal
        ? 'fit-content'
        : typeof props.height === 'number'
        ? `${props.height}px`
        : props.height,
      width: isHorizontal
        ? typeof props.width === 'number'
          ? `${props.width}px`
          : props.width
        : 'fit-content',
      '--divider-direction': isHorizontal ? 'row' : 'column'
    }
  })

  const dividerClass = computed(() => {
    return ['yt-divider', `yt-divider--${props.direction}`, `yt-divider--${props.align}`]
  })

  const dividerStyle = computed(() => {
    const isHorizontal = props.direction === 'horizontal'
    if (props.type !== 'solid') {
      return {
        borderColor: props.lineColor,
        borderWidth: isHorizontal ? '1px 0 0 0' : '0 0 0 1px',
        borderStyle: props.type,
        '--divider-margin': typeof props.margin === 'number' ? `${props.margin}px` : props.margin
      }
    } else {
      return {
        backgroundColor: props.lineColor,
        [isHorizontal ? 'height' : 'width']: '1px',
        '--divider-margin': typeof props.margin === 'number' ? `${props.margin}px` : props.margin
      }
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
    v-if="props.content"
    class="yt-divider--container"
    :style="dividerContainerStyle"
  >
    <view
      :class="[...dividerClass, 'start-line']"
      :style="dividerStyle"
    />
    <span :style="textStyle">{{ props.content }}</span>
    <view
      :class="[...dividerClass, 'end-line']"
      :style="dividerStyle"
    />
  </view>
  <view
    v-else
    :class="dividerClass"
    :style="dividerStyle"
  />
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_divider.scss';
</style>
