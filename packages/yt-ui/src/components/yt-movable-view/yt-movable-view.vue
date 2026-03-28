<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    zIndex?: number
    width?: number | string
    height?: number | string
    innerWidth?: number | string
    innerHeight?: number | string
    direction?: 'all' | 'vertical' | 'horizontal' | 'none'
    inertia?: boolean
    outOfBounds?: boolean
    x?: number | string
    y?: number | string
    damping?: number
    friction?: number
    disabled?: boolean
    scale?: boolean
    scaleArea?: boolean
    scaleMin?: number
    scaleMax?: number
    scaleValue?: number
    animation?: boolean
    change?: (event: {
      detail: {
        x: number
        y: number
        source: 'touch' | 'touch-out-of-bounds' | 'out-of-bounds' | 'friction' | ''
      }
    }) => void
    scaleChange?: (event: { detail: { x: number; y: number; scale: number } }) => void
  }

  const props = withDefaults(defineProps<Props>(), {
    zIndex: 2000,
    width: '100%',
    height: 200,
    innerWidth: '100%',
    innerHeight: 200,
    direction: 'all',
    inertia: true,
    outOfBounds: true,
    x: 0,
    y: 0,
    damping: 20,
    friction: 3,
    disabled: false,
    scale: true,
    scaleArea: true,
    scaleMin: 0.5,
    scaleMax: 10,
    scaleValue: 1,
    animation: true
  })

  const emit = defineEmits<{
    change: [
      {
        x: number
        y: number
        source: 'touch' | 'touch-out-of-bounds' | 'out-of-bounds' | 'friction' | ''
      }
    ]
    scaleChange: [{ x: number; y: number; scale: number }]
  }>()

  const moveableAreaStyle = computed(() => {
    return {
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      height: typeof props.height === 'number' ? `${props.height}px` : props.height,
      zIndex: props.zIndex
    }
  })

  const moveableViewStyle = computed(() => {
    return {
      width: typeof props.innerWidth === 'number' ? `${props.innerWidth}px` : props.innerWidth,
      height: typeof props.innerHeight === 'number' ? `${props.innerHeight}px` : props.innerHeight
    }
  })

  function handleChange(e: any) {
    emit('change', e.detail)
  }

  function handleScaleChange(e: any) {
    emit('scaleChange', e.detail)
  }

  defineOptions({
    name: 'YtMovableView'
  })
</script>

<template>
  <movable-area
    :scale-area="scaleArea"
    :style="moveableAreaStyle"
  >
    <movable-view
      :style="moveableViewStyle"
      :direction="direction"
      :x="x"
      :y="y"
      :inertia="inertia"
      :out-of-bounds="outOfBounds"
      :damping="damping"
      :friction="friction"
      :disabled="disabled"
      :scale="scale"
      :scale-min="scaleMin"
      :scale-max="scaleMax"
      :scale-value="scaleValue"
      :animation="animation"
      @change="handleChange"
      @scale="handleScaleChange"
    >
      <slot />
    </movable-view>
  </movable-area>
</template>
