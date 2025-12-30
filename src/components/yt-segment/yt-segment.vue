<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { ThemeColor } from '../../types/theme-types'
  import { SizeType } from '../../types/prop-types'
  interface Props {
    theme?: ThemeColor
    size?: SizeType
    list: string[]
    modelValue?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    theme: 'classic',
    size: 'medium',
    list: () => [],
    modelValue: 0
  })
  const emit = defineEmits<{
    'update:modelValue': [modelValue: number]
    change: [index: number]
  }>()

  const curIndex = ref(props.modelValue)

  const segmentTextClass = computed(() => {
    return (index: number) => ({
      'yt-segment--text': true,
      'yt-segment--text-first': index === 0,
      'yt-segment--text-last': index === props.list.length - 1,
      'yt-segment--text-active': curIndex.value === index
    })
  })
  const segmentClass = computed(() => {
    return ['yt-segment', `yt-segment--${props.size}`, `yt-segment--theme-${props.theme}`]
  })

  function handleClick(index: number) {
    if (curIndex.value === index) return
    curIndex.value = index
    emit('update:modelValue', index)
    emit('change', index)
  }

  defineOptions({
    name: 'YtSegment'
  })
</script>

<template>
  <view :class="segmentClass">
    <view
      @click="handleClick(index)"
      v-for="(text, index) in list"
      :key="index"
      :class="segmentTextClass(index)"
    >
      {{ text }}
    </view>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_segment.scss';
  @use '../../styles/themes';
</style>
