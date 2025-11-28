<script setup lang="ts">
  import { computed, watchEffect } from 'vue'
  import { iconMap } from './icon-map'
  import { ref } from 'vue'

  interface Props {
    name: string
    size?: number | string
    strokeColor?: string
    fillColor?: string
    strokeWidth?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    name: '',
    size: 32,
    strokeColor: 'red',
    fillColor: '#333',
    strokeWidth: 0
  })

  const emit = defineEmits<{
    click: [e: any]
  }>()

  const iconClass = computed(() => {
    return ['yt-icon', `yt-icon--${props.name}`]
  })

  const iconStyle = computed(() => {
    const sizeValue = typeof props.size === 'number' ? props.size : Number(props.size)
    return {
      transform: `scale(${sizeValue * 0.01})`,
      '--icon-stroke-color': props.strokeColor,
      '--icon-fill-color': props.fillColor,
      '--icon-stroke-width':
        typeof props.strokeWidth === 'number' ? `${props.strokeWidth}px` : props.strokeWidth
    }
  })

  const handleClick = (e: any) => {
    emit('click', e)
  }

  const svgStr = ref<string>('')

  watchEffect(() => {
    svgStr.value = iconMap[props.name] || ''
    if (props.name && !svgStr.value) {
      console.warn(`[${props.name}] icon was not found! 名为${props.name}的icon不存在!`)
    }
  })

  defineOptions({
    name: 'YtIcon'
  })
</script>

<template>
  <view
    :class="iconClass"
    :style="iconStyle"
    @click="handleClick"
    v-html="svgStr"
  ></view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_icon.scss';
</style>
