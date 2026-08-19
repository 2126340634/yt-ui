<script setup lang="ts">
import { computed, ref, getCurrentInstance, watch, onBeforeUnmount, type CSSProperties } from 'vue'

interface Props {
  layout?: 'single' | 'double' | 'waterfall'
  rowGap?: number | string
  columnGap?: number | string
  bufferDistance?: number
  list?: any[]
  itemKey?: string
  width?: number | string
  height?: number | string
  chunkSize?: number // 每个分块的数量
  estimatedSize?: number // 每个分块的预估高度 (px)
  showScrollbar?: boolean
  refresher?: boolean
  threshold?: number
  triggered?: boolean
  refresherBgColor?: string
  refresherStyle?: 'black' | 'white' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'single',
  rowGap: 8,
  columnGap: 8,
  bufferDistance: 1200,
  list: () => [],
  itemKey: '',
  width: '100%',
  height: '100%',
  chunkSize: 40,
  estimatedSize: 1000,
  showScrollbar: false,
  refresher: false,
  threshold: 50,
  triggered: false,
  refresherBgColor: '#fff',
  refresherStyle: 'black'
})

const emit = defineEmits(['scroll', 'scrollToUpper', 'scrollToLower', 'pull', 'refresh', 'restore', 'abort'])

// 计算切片
const chunkedList = computed(() => {
  const chunks: { id: number; startIndex: number; items: Props['list'] }[] = []
  for (let i = 0; i < props.list.length; i += props.chunkSize) {
    chunks.push({
      id: i / props.chunkSize,
      startIndex: i,
      items: props.list.slice(i, i + props.chunkSize)
    })
  }
  return chunks
})

const instance = getCurrentInstance()
let observer: UniApp.IntersectionObserver | null = null
const visibleMap = ref<Record<number, boolean>>({}) // 每个分块的是否渲染
const heightMap = ref<Record<number, number>>({}) // 每个分块的高度

function getChunkVisibility(id: number) {
  return visibleMap.value[id] || false
}
function getChunkHeight(id: number) {
  return heightMap.value[id] || 0
}
function startObserver() {
  observer?.disconnect()
  if (!props.list || !props.list.length) return
  observer = uni.createIntersectionObserver(instance, { observeAll: true })
  observer.relativeToViewport({ top: props.bufferDistance, bottom: props.bufferDistance }).observe('.chunk-anchor', (res: any) => {
    const { id } = res.dataset
    const isIntersecting = res.intersectionRatio > 0
    visibleMap.value[id] = isIntersecting
    if (isIntersecting && res.boundingClientRect.height > 0) {
      heightMap.value[id] = res.boundingClientRect.height
    }
  })
}

const chunkContentClass = computed(() => {
  return ['chunk-content', `layout-${props.layout}`]
})
const chunkContentStyle = computed<CSSProperties>(() => {
  const columnGap = typeof props.columnGap === 'number' ? `${props.columnGap}px` : props.columnGap
  const rowGap = typeof props.rowGap === 'number' ? `${props.rowGap}px` : props.rowGap
  if (props.layout === 'waterfall') {
    return {
      columnGap,
      marginBottom: rowGap // 分块之间的间距
    }
  }
  return { columnGap, rowGap }
})
const chunkContentItemStyle = computed<CSSProperties>(() => {
  const rowGap = typeof props.rowGap === 'number' ? `${props.rowGap}px` : props.rowGap
  // 瀑布流为block布局,不存在行间距rowGap,改用marginBottom作为上下边距
  const marginBottom = props.layout === 'waterfall' ? rowGap : 0
  return { marginBottom }
})

watch(
  () => props.list.length,
  () => {
    startObserver()
  },
  { immediate: true }
)

onBeforeUnmount(() => observer && observer.disconnect())

const virtualListStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))
</script>

<template>
  <scroll-view
    class="yt-virtual-list"
    :class="{ 'yt-virtual-list--hidden-scrollbar': !showScrollbar }"
    :style="virtualListStyle"
    scroll-y
    :show-scrollbar="showScrollbar"
    :refresher-enabled="refresher"
    :refresher-threshold="threshold"
    :refresher-triggered="triggered"
    :refresher-background="refresherBgColor"
    :refresher-default-style="refresherStyle"
    scroll-with-animation
    @scroll="(e: any) => emit('scroll', e)"
    @scrolltoupper="emit('scrollToUpper')"
    @scrolltolower="emit('scrollToLower')"
    @refresherpulling="emit('pull')"
    @refresherrefresh="emit('refresh')"
    @refresherrestore="emit('restore')"
    @refresherabort="emit('abort')"
  >
    <!-- prefix slot -->
    <slot name="prefix" />

    <view
      v-for="chunk in chunkedList"
      :key="chunk.id"
      :data-id="chunk.id"
      class="chunk-anchor"
      :style="{ minHeight: getChunkVisibility(chunk.id) ? 'auto' : (getChunkHeight(chunk.id) || estimatedSize) + 'px' }"
    >
      <view v-if="getChunkVisibility(chunk.id)" :class="chunkContentClass" :style="chunkContentStyle">
        <view v-for="(item, index) in chunk.items" :key="item[itemKey] || index" class="chunk-content-item" :style="chunkContentItemStyle">
          <slot name="list-item" :item="item" :index="chunk.startIndex + index" />
        </view>
      </view>
    </view>

    <!-- suffix slot -->
    <slot name="suffix" />
  </scroll-view>
</template>

<style lang="scss" scoped>
@use '../../styles/components/virtual-list';

.yt-virtual-list--hidden-scrollbar {
  ::-webkit-scrollbar {
    display: none;
  }
}
.chunk-anchor {
  width: 100%;
  display: block;
  overflow: hidden;
}
</style>
