<script setup lang="ts">
  import { computed, CSSProperties, ref } from 'vue'

  interface Props {
    list: string[]
    modelValue?: number
    zIndex?: number
    fixed?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    list: () => [],
    modelValue: 0,
    zIndex: 500,
    fixed: true
  })

  const emit = defineEmits<{
    change: [e: Event, activeIndex: number]
    'update:modelValue': [activeIndex: number]
  }>()

  const activeIndex = ref(props.modelValue)

  const topTabbarStyle = computed(() => {
    return {
      zIndex: props.zIndex,
      position: props.fixed ? 'fixed' : 'relative'
    } as CSSProperties
  })

  const sliderContainerStyle = computed(() => {
    return {
      width: `${100 / props.list.length}%`,
      transform: `translateX(${activeIndex.value * 100}%)`
    }
  })

  function handleClick(e: Event, index: number) {
    if (index === activeIndex.value) return
    activeIndex.value = index
    emit('change', e, index)
    emit('update:modelValue', index)
  }
</script>

<template>
  <view
    class="yt-top-tabbar"
    :style="topTabbarStyle"
  >
    <!-- top-tabbar -->
    <view
      class="yt-top-tabbar--item"
      v-for="(name, index) in list"
      :key="index"
      @click="handleClick($event, index)"
    >
      <span
        :class="[
          'yt-top-tabbar--item-text',
          {
            active: index === activeIndex
          }
        ]"
      >
        {{ name }}
      </span>
    </view>
    <!-- slider -->
    <view
      class="yt-top-tabbar--slider-container"
      :style="sliderContainerStyle"
    >
      <yt-icon
        name="Slider"
        class="yt-top-tabbar--slider-container-item"
        :size="12"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/themes';
  @use '../../styles/components/top-tabbar';
</style>
