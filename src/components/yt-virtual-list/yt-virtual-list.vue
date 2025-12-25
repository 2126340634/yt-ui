<script setup lang="ts">
  import { computed, CSSProperties, getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue'

  interface Props {
    list: any[]
    itemKey: string
    width?: number | string
    height?: number | string
    direction?: 'vertical' | 'horizontal'
    buffer?: number // item预渲染缓冲数量, 防止闪烁
    estimatedSize?: number
    showScrollbar?: boolean
    refresher?: boolean
    threshold?: number
    triggered?: boolean
    refresherBgColor?: string
    refresherStyle?: 'black' | 'white' | 'none'
  }

  const props = withDefaults(defineProps<Props>(), {
    list: () => [],
    itemKey: '',
    width: '100%',
    height: '100%',
    direction: 'vertical',
    buffer: 5,
    estimatedSize: 30,
    showScrollbar: false,
    refresher: false,
    threshold: 50,
    triggered: false,
    refresherBgColor: '#fff',
    refresherStyle: 'black'
  })

  if (!props.itemKey) console.warn('[yt-virtual-list] 缺少参数itemKey')

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
  const measureItem = () => {
    const start = visibleRange.value.start
    uni
      .createSelectorQuery()
      .in(instance?.proxy)
      .selectAll(`.yt-virtual-list--container-item`)
      .boundingClientRect((res: any) => {
        const rects = res as any[]
        if (!rects || !rects.length) return
        rects.forEach((res, index) => {
          const itemIndex = start + index
          if (measured.has(itemIndex)) return
          const size = isVertical.value ? res.height : res.width
          if (size > 0 && itemSizes.value[itemIndex] !== size) {
            itemSizes.value[itemIndex] = size
            measured.add(itemIndex)
          }
        })
      })
      .exec()
  }
  const getItemKey = computed(() => {
    return (item: any, index: number) => {
      if (typeof item === 'object' && item !== null && props.itemKey) {
        return item[props.itemKey] || visibleRange.value.start + index
      }
      return visibleRange.value.start + index
    }
  })

  onMounted(async () => {
    await nextTick()
    uni
      .createSelectorQuery()
      .in(instance?.proxy)
      .select('.yt-virtual-list')
      .boundingClientRect((res: any) => {
        if (res) {
          containerSize.value = isVertical.value ? res.height : res.width
        } else {
          console.warn('[yt-virtual-list] 未获取到列表容器大小')
        }
      })
      .exec()
  })

  // 清空列表高度缓存
  const resetCache = () => {
    itemSizes.value = []
    measured.clear()
  }

  watch(
    () => props.list,
    (newList: any[], oldList: any[]) => {
      // 首次测量无需清空
      if (!oldList || !oldList.length) return
      if (!newList || !newList.length) {
        resetCache()
        return
      }
      const oldFirstKey = oldList?.[0]?.[props.itemKey]
      const newFirstKey = newList?.[0]?.[props.itemKey]
      // 首项key值变化(说明列表被替换)或者有删除操作
      if (oldFirstKey !== newFirstKey || newList.length < oldList.length) {
        resetCache()
      }
    },
    { deep: false }
  )

  // 测量item高度
  watch(
    () => visibleRange.value,
    async () => {
      await nextTick()
      measureItem()
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
    :class="[
      'yt-virtual-list',
      {
        'yt-virtual-list--hidden-scrollbar': !showScrollbar
      }
    ]"
    :style="virtualListStyle"
    :scroll-y="isVertical"
    :scroll-x="!isVertical"
    :show-scrollbar="showScrollbar"
    @scroll="handleScroll"
    :refresher-enabled="refresher"
    :refresher-threshold="threshold"
    :refresher-triggered="triggered"
    :refresher-background="refresherBgColor"
    :refresher-default-style="refresherStyle"
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
        :key="getItemKey(item, index)"
        class="yt-virtual-list--container-item"
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

<style lang="scss" scoped>
  .yt-virtual-list--hidden-scrollbar {
    ::-webkit-scrollbar {
      display: none;
    }
  }
</style>
