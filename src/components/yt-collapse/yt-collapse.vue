<script setup lang="ts">
import { computed, ref, shallowRef, watchEffect } from 'vue'

interface Props {
  titleList?: string[]
  iconSide?: 'left' | 'right'
  gap?: number | string
  defaultActive?: number[]
  borderColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  titleList: () => [],
  iconSide: 'right',
  gap: 8,
  defaultActive: () => [],
  borderColor: '#e5e7eb'
})

// props的reactive转为shallowRef，避免深度监听每个属性
const safeList = shallowRef<string[]>([])
watchEffect(() => {
  safeList.value = props.titleList
})

const emit = defineEmits<{
  change: [{ index: number; activeIndexes: number[] }]
}>()

const isIconLeftSide = computed(() => {
  return props.iconSide === 'left'
})
const collapseStyle = computed(() => {
  return {
    '--item-justify-content': isIconLeftSide.value ? 'start' : 'space-between',
    '--item-padding': `${typeof props.gap === 'number' ? `${props.gap}px` : props.gap} 0`,
    '--item-border-color': props.borderColor
  }
})
const collapseItemClass = (index: number) => ({
  'yt-collapse--item': true,
  'yt-collapse--item-active': isExpanded(index)
})
const collapseItemStyle = (index: number) => {
  return {
    borderTop: index === 0 ? `1px solid ${props.borderColor}` : 'none'
  }
}
const collapseContentClass = (index: number) => ({
  'yt-collapse--content': true,
  'yt-collapse--content-active': isExpanded(index)
})

// 默认展开项(仅初始化时生效,后续通过 toggleExpand 控制)
const expandedSet = ref<Set<number>>(new Set(props.defaultActive))

const isExpanded = (index: number) => expandedSet.value.has(index)

function toggleExpand(index: number) {
  if (isExpanded(index)) {
    expandedSet.value.delete(index)
  } else {
    expandedSet.value.add(index)
  }
  expandedSet.value = new Set(expandedSet.value)
  emit('change', { index, activeIndexes: Array.from(expandedSet.value) })
}

defineOptions({
  name: 'YtCollapse'
})
</script>

<template>
  <view class="yt-collapse" :style="collapseStyle">
    <template v-for="(title, index) in safeList" :key="index">
      <!-- collapse-item -->
      <view :class="collapseItemClass(index)" :style="collapseItemStyle(index)" @click="toggleExpand(index)">
        <yt-icon v-if="isIconLeftSide" class="yt-collapse--item-icon" name="ArrowRight" :size="14" :width="30" :height="30" />
        <span class="yt-collapse--item-title">{{ title }}</span>
        <yt-icon v-if="!isIconLeftSide" class="yt-collapse--item-icon" name="ArrowRight" :size="14" :width="30" :height="30" />
      </view>
      <!-- collapse-item-content -->
      <view v-show="isExpanded(index)" :class="collapseContentClass(index)">
        <slot :name="`collapse-item-${index}`" :title="title" :index="index" />
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
@use '../../styles/components/_collapse.scss';
</style>
