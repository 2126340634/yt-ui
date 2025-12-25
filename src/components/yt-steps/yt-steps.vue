<script setup lang="ts">
  import { computed } from 'vue'
  import { iconMap } from '../yt-icon/icon-map'
  import { ThemeColor } from '../../types/theme-types'

  interface Props {
    theme?: ThemeColor
    activeIndex?: number
    list?: { text?: string; icon?: string }[]
    gap?: number
    direction?: 'horizontal' | 'vertical'
  }

  const props = withDefaults(defineProps<Props>(), {
    theme: 'classic',
    activeIndex: 0,
    list: () => [],
    gap: 8,
    direction: 'horizontal'
  })

  const stepsClass = computed(() => {
    return ['yt-steps', `yt-steps--${props.direction}`, `yt-steps--theme-${props.theme}`]
  })
  const stepsStyle = computed(() => {
    return {
      '--steps-gap': `${props.gap}px`
    }
  })
  const stepsItemClass = computed(() => {
    return (index: number) => ({
      'yt-steps--item': true,
      'yt-steps--item-active': index <= props.activeIndex
    })
  })
  const stepsItemStyle = computed(() => {
    return (item: any) => ({
      '--item-text-height': item?.text ? '20px' : '0px'
    })
  })

  defineOptions({
    name: 'YtSteps'
  })
</script>

<template>
  <view
    :class="stepsClass"
    :style="stepsStyle"
  >
    <view
      v-for="(step, index) in list"
      :key="index"
      :class="stepsItemClass(index)"
      :style="stepsItemStyle(step)"
    >
      <view class="yt-steps--item-icon">
        <yt-icon
          v-if="step.icon && iconMap[step.icon]"
          width="100%"
          height="100%"
          :name="step.icon"
        />
        <image
          class="yt-steps--item-icon-image"
          v-else-if="step.icon"
          :src="step.icon"
          mode="aspectFit"
        />
        <span
          class="yt-steps--item-icon-text"
          v-else
        >
          {{ index + 1 }}
        </span>
      </view>
      <span class="yt-steps--item-text">{{ step.text }}</span>
      <view
        class="yt-steps--item-line"
        v-if="index < props.list.length - 1"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_steps.scss';
  @use '../../styles/themes';
</style>
