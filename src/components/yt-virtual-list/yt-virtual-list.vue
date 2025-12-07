<script setup lang="ts">
  import { computed, CSSProperties, getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue'

  interface Props {
    list: any[]
    width?: number | string
    height?: number | string
    direction?: 'vertical' | 'horizontal'
    buffer?: number // item预渲染缓冲数量, 防止闪烁
    estimatedSize?: number
    showScrollbar?: boolean
    refresher?: boolean // 是否开启下拉刷新
    threshold?: number // 下拉刷新阈值
  }

  const props = withDefaults(defineProps<Props>(), {
    list: () => [],
    width: '100%',
    height: '100%',
    direction: 'vertical',
    buffer: 5,
    estimatedSize: 30,
    showScrollbar: false,
    refresher: false,
    threshold: 45
  })

  const emit = defineEmits<{
    scroll: [e: any]
    scrollToUpper: []
    scrollToLower: []
    pull: []
    refresh: []
    restore: []
    abort: []
  }>()

  const instance = getCurrentInstance()
  const containerSize = ref(0)
  const scrollPos = ref(0)
  const itemSizes = ref<number[]>([])
  const measured = new Set<number>()

  const isVertical = computed(() => {
    return props.direction === 'vertical'
  })

  const virtualListStyle = computed(() => {
    return {
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      height: typeof props.height === 'number' ? `${props.height}px` : props.height
    }
  })
  // 占位符撑起总高度
  const placeholderStyle = computed(() => {
    return {
      [isVertical.value ? 'height' : 'width']: `${totalSize.value}px`
    }
  })
  const totalSize = computed(() => {
    return props.list.reduce(
      (sum, _, index) => sum + (itemSizes.value[index] || props.estimatedSize),
      0
    )
  })
  // 前缀和存储内容高度累加
  const prefixSum = computed(() => {
    const sum = [0]
    for (let i = 0; i < props.list.length; i++) {
      sum[i + 1] = sum[i] + (itemSizes.value[i] || props.estimatedSize)
    }
    return sum
  })
  const getStartIndex = (): number => {
    if (!props.list.length) return 0
    let left = 0
    let right = props.list.length
    while (left < right) {
      const mid = Math.floor(left + (right - left) / 2)
      if (prefixSum.value[mid] <= scrollPos.value) {
        left = mid + 1
      } else {
        right = mid
      }
    }
    return Math.max(0, Math.min(left - 1 - props.buffer, props.list.length - 1))
  }
  const visibleRange = computed(() => {
    if (!props.list.length) return { start: 0, end: 0 }
    const start = getStartIndex()
    let offset = 0
    for (let i = 0; i < start; i++) {
      offset += itemSizes.value[i] || props.estimatedSize
    }
    let end = start
    while (offset < scrollPos.value + containerSize.value && end < props.list.length) {
      offset += itemSizes.value[end] || props.estimatedSize
      end++
    }
    return { start, end: Math.min(end + props.buffer, props.list.length) }
  })
  const visibleList = computed(() => {
    return props.list.slice(visibleRange.value.start, visibleRange.value.end)
  })
  const startOffset = computed(() => {
    let offset = 0
    for (let i = 0; i < visibleRange.value.start; i++) {
      offset += itemSizes.value[i] || props.estimatedSize
    }
    return offset
  })
  const containerStyle = computed(() => {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      transform: isVertical.value
        ? `translateY(${startOffset.value}px)`
        : `translateX(${startOffset.value}px)`,
      display: 'flex',
      flexDirection: isVertical.value ? 'column' : 'row',
      [isVertical.value ? 'width' : 'height']: '100%',
      alignItems: isVertical.value ? 'flex-start' : 'stretch'
    } as CSSProperties
  })
  const itemStyle = computed(() => {
    return {
      [isVertical.value ? 'width' : 'height']: '100%',
      boxSizing: 'border-box',
      flexShrink: 0
    } as CSSProperties
  })
  const measureItem = (index: number) => {
    const itemIndex = visibleRange.value.start + index
    if (measured.has(itemIndex)) return
    uni
      .createSelectorQuery()
      .in(instance?.proxy)
      .select(`.item-${itemIndex}`)
      .boundingClientRect((res: any) => {
        if (res) {
          const size = isVertical.value ? res.height : res.width
          if (size > 0 && itemSizes.value[itemIndex] !== size) {
            itemSizes.value[itemIndex] = size
            measured.add(itemIndex)
          }
        }
      })
      .exec()
  }

  onMounted(async () => {
    await nextTick()
    uni
      .createSelectorQuery()
      .in(instance?.proxy)
      .select('.yt-virtual-list')
      .boundingClientRect((res: any) => {
        if (res) {
          containerSize.value = isVertical.value ? res.height : res.width
        }
      })
      .exec()
  })

  // 监测数据源变化
  watch(
    () => props.list,
    () => {
      itemSizes.value = []
      measured.clear()
    },
    { deep: true }
  )

  // 测量可视区域item大小
  watch(
    () => visibleRange.value,
    async () => {
      await nextTick()
      for (let i = 0; i < visibleList.value.length; i++) {
        measureItem(i)
      }
    },
    { immediate: true }
  )

  function handleScroll(e: any) {
    scrollPos.value = isVertical.value ? e.detail.scrollTop : e.detail.scrollLeft
    emit('scroll', e)
  }
</script>

<template>
  <scroll-view
    class="yt-virtual-list"
    :style="virtualListStyle"
    :scroll-y="isVertical"
    :scroll-x="!isVertical"
    :show-scrollbar="showScrollbar"
    :refresher-enabled="refresher"
    :refresher-threshold="threshold"
    @scroll="handleScroll"
    @scrolltoupper="$emit('scrollToUpper')"
    @scrolltolower="$emit('scrollToLower')"
    @refresherpulling="$emit('pull')"
    @refresherrefresh="$emit('refresh')"
    @refresherrestore="$emit('restore')"
    @refresherabort="$emit('abort')"
  >
    <view
      class="yt-virtual-list--placeholder"
      :style="placeholderStyle"
    />
    <view
      class="yt-virtual-list--container"
      :style="containerStyle"
    >
      <view
        v-for="(item, index) in visibleList"
        :key="index"
        :class="['yt-virtual-list--container-item', `item-${visibleRange.start + index}`]"
        :style="itemStyle"
      >
        <slot
          name="list-item"
          :item="item"
          :index="visibleRange.start + index"
        />
      </view>
    </view>
  </scroll-view>
</template>
