<script setup lang="ts">
  import { computed } from 'vue'
  import { iconMap } from './icon-map'
  import { ImageMode } from '../../types/prop-types'

  interface Props {
    name: string
    size?: number
    width?: number | string
    height?: number | string
    fit?: ImageMode
  }

  const props = withDefaults(defineProps<Props>(), {
    name: '',
    size: 24,
    width: 60,
    height: 60,
    fit: 'widthFix'
  })

  const emit = defineEmits<{
    click: [e: any]
  }>()

  const iconClass = computed(() => {
    return ['yt-icon', `yt-icon--${props.name}`]
  })

  const iconStyle = computed(() => {
    return {
      transform: `scale(${props.size / 24})`,
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      height: typeof props.height === 'number' ? `${props.height}px` : props.height
    }
  })

  const handleClick = (e: any) => {
    emit('click', e)
  }

  const imgStr = computed(() => {
    const str = iconMap[props.name] || ''
    if (props.name && !str) {
      console.warn(`[${props.name}] icon was not found! 名为${props.name}的icon不存在!`)
    }
    return str
  })

  defineOptions({
    name: 'YtIcon'
  })
</script>

<template>
  <image
    :class="iconClass"
    :style="iconStyle"
    @click="handleClick"
    :src="imgStr"
    :mode="fit"
  ></image>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_icon.scss';
</style>
