<script setup lang="ts">
  import { computed, watchEffect } from 'vue'
  import { iconMap } from './icon-map'
  import { ref } from 'vue'

  interface Props {
    name: string
    size?: number
    width?: number | string
    height?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    name: '',
    size: 32,
    width: 60,
    height: 60
  })

  const emit = defineEmits<{
    click: [e: any]
  }>()

  const iconClass = computed(() => {
    return ['yt-icon', `yt-icon--${props.name}`]
  })

  const iconStyle = computed(() => {
    return {
      transform: `scale(${props.size * 0.01})`,
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      height: typeof props.height === 'number' ? `${props.height}px` : props.height
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
  <image
    :class="iconClass"
    :style="iconStyle"
    @click="handleClick"
    :src="svgStr"
  ></image>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_icon.scss';
</style>
