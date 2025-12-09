<script setup lang="ts">
  import { computed, CSSProperties } from 'vue'

  interface Props {
    list: string[]
    activeIndex: number
    zIndex?: number
    fixed?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    list: () => [],
    activeIndex: 0,
    zIndex: 500,
    fixed: true
  })

  const topTabbarStyle = computed(() => {
    return {
      zIndex: props.zIndex,
      position: props.fixed ? 'fixed' : 'relative'
    } as CSSProperties
  })
</script>

<template>
  <view
    class="yt-top-tabbar"
    :style="topTabbarStyle"
  >
    <view
      class="yt-top-tabbar--item"
      v-for="(name, index) in list"
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
      <yt-icon
        name="TopTabbarActive"
        :class="[
          'yt-top-tabbar--item-icon',
          {
            active: index === activeIndex
          }
        ]"
        :width="120"
        :height="60"
        :size="20"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/themes';
  @use '../../styles/components/top-tabbar';
</style>
