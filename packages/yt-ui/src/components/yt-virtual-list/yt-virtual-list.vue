<script setup lang="ts">
import { computed, ref, getCurrentInstance, watch, onBeforeUnmount } from 'vue'

interface Props {
  list: any[]
  itemKey: string
  width?: number | string
  height?: number | string
  chunkSize?: number       // 每个分块的数量
  estimatedSize?: number   // 每个分块的预估高度 (px)
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
  chunkSize: 10,
  estimatedSize: 1000,
  showScrollbar: false,
  refresher: false,
  threshold: 50,
  triggered: false,
  refresherBgColor: '#fff',
  refresherStyle: 'black'
})

const emit = defineEmits([
  'scroll', 'scrollToUpper', 'scrollToLower', 
  'pull', 'refresh', 'restore', 'abort'
])

const chunkedList = computed(() => {
  const chunks = []
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
const visibleMap = ref<Record<number, boolean>>({})
const heightMap = ref<Record<number, number>>({})

function getChunkVisibility(id: number) {
  return visibleMap.value[id] || false
}
function getChunkHeight(id: number) {
  return heightMap.value[id] || 0
}
function startObserver() {
  if (observer) observer.disconnect()
  if (!props.list.length) return
  observer = uni.createIntersectionObserver(instance, { observeAll: true })
  // 600px缓冲区
  observer.relativeToViewport({ top: 600, bottom: 600 })
    .observe('.chunk-anchor', (res: any) => {
      const { id } = res.dataset
      const isIntersecting = res.intersectionRatio > 0
      visibleMap.value[id] = isIntersecting
      if (isIntersecting && res.boundingClientRect.height > 0) {
        heightMap.value[id] = res.boundingClientRect.height
      }
    })
}

watch(() => props.list.length, () => {
  startObserver()
}, { immediate: true })

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
    @scroll="(e: any) => emit('scroll', e)"
    @scrolltoupper="emit('scrollToUpper')"
    @scrolltolower="emit('scrollToLower')"
    @refresherpulling="emit('pull')"
    @refresherrefresh="emit('refresh')"
    @refresherrestore="emit('restore')"
    @refresherabort="emit('abort')"
  >
    <slot name="prefix" />
    <view 
      v-for="chunk in chunkedList" 
      :key="chunk.id"
      :data-id="chunk.id"
      class="chunk-anchor"
      :style="{ minHeight: getChunkVisibility(chunk.id) ? 'auto' : (getChunkHeight(chunk.id) || estimatedSize) + 'px' }"
    >
      <template v-if="getChunkVisibility(chunk.id)">
        <view v-for="(item, index) in chunk.items" :key="item[itemKey] || index">
          <slot name="list-item" :item="item" :index="chunk.startIndex + index" />
        </view>
      </template>
    </view>
    <slot name="suffix" />
  </scroll-view>
</template>

<style lang="scss" scoped>
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