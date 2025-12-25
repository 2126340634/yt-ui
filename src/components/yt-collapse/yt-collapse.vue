<script setup lang="ts">
  import { computed, ref, useSlots } from 'vue'

  interface Props {
    titleList: { title: string; [key: string]: string }[]
    itemKey: string
    buffer?: number
    iconSide?: 'left' | 'right'
    gap?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    list: () => [],
    itemKey: '',
    buffer: 5,
    iconSide: 'right',
    gap: 8
  })

  const slots = useSlots()

  if (!props.itemKey) console.warn('[yt-collapse] 缺少参数itemKey')

  const emit = defineEmits<{
    change: [{ index: number; activeIndexes: number[] }]
  }>()

  const isIconLeftSide = computed(() => {
    return props.iconSide === 'left'
  })
  const collapseItemClass = computed(() => {
    return (index: number) => ({
      'yt-collapse--item': true,
      'yt-collapse--item-active': isExpanded.value(index)
    })
  })
  const collapseItemStyle = computed(() => {
    const paddingVertical = typeof props.gap === 'number' ? `${props.gap}px` : props.gap
    return (index: number) => ({
      justifyContent: isIconLeftSide.value ? 'start' : 'space-between',
      borderTop: index === 0 ? '1px solid #e5e7eb' : 'none',
      padding: `${paddingVertical} 0`
    })
  })
  const collapseContentClass = computed(() => {
    return (index: number) => ({
      'yt-collapse--content': true,
      'yt-collapse--content-active': isExpanded.value(index)
    })
  })
  const hasContent = computed(() => {
    return (slotName: string) => !!slots[`collapse-item-${slotName}`]
  })

  const expandedSet = ref<Set<number>>(new Set())

  const isExpanded = computed(() => {
    return (index: number) => expandedSet.value.has(index)
  })

  function toggleExpand(index: number) {
    if (isExpanded.value(index)) {
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
  <yt-virtual-list
    :list="titleList"
    :itemKey="itemKey"
    :buffer="buffer"
    :estimatedSize="60"
  >
    <template #list-item="{ item, index }">
      <!-- collapse-item -->
      <view
        @click="toggleExpand(index)"
        :class="collapseItemClass(index)"
        :style="collapseItemStyle(index)"
      >
        <yt-icon
          class="yt-collapse--item-icon"
          v-if="isIconLeftSide"
          name="ArrowRight"
          :size="14"
          :width="30"
          :height="30"
        />
        <span class="yt-collapse--item-title">{{ item.title }}</span>
        <yt-icon
          class="yt-collapse--item-icon"
          v-if="!isIconLeftSide"
          name="ArrowRight"
          :size="14"
          :width="30"
          :height="30"
        />
      </view>
      <!-- collapse-item-content -->
      <view
        v-if="hasContent(item[itemKey])"
        :class="collapseContentClass(index)"
      >
        <slot
          :name="`collapse-item-${item[itemKey]}`"
          :index="index"
          :isAcitve="isExpanded(index)"
        />
      </view>
    </template>
  </yt-virtual-list>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_collapse.scss';
</style>
