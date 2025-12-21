<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { ThemeColor } from '../../types/theme-types'
  import { SizeType } from '../../types/prop-types'
  import { iconMap } from '../yt-icon/icon-map'

  interface Props {
    theme?: ThemeColor
    size?: SizeType
    horizontal?: 'right' | 'left'
    vertical?: 'bottom' | 'top'
    zIndex?: number
    offset?: number[]
    popMenu?: boolean
    menuList?: { text?: string; icon: string }[]
  }

  const props = withDefaults(defineProps<Props>(), {
    theme: 'classic',
    size: 'medium',
    horizontal: 'right',
    vertical: 'bottom',
    zIndex: 500,
    offset: () => [],
    popMenu: false,
    menuList: () => []
  })

  const emit = defineEmits<{
    fabClick: [e: Event]
    menuItemClick: [e: Event, index: number]
  }>()

  const hasPoppedUp = ref(false)

  function handleFabClick(e: Event) {
    emit('fabClick', e)
    if (props.popMenu) hasPoppedUp.value = !hasPoppedUp.value
  }

  function handleMenuItemClick(e: Event, index: number) {
    emit('menuItemClick', e, index)
  }

  const fabClass = computed(() => {
    return [
      'yt-fab',
      `yt-fab--theme-${props.theme}`,
      `yt-fab--${props.horizontal}`,
      `yt-fab--${props.vertical}`
    ]
  })
  const fabStyle = computed(() => {
    return {
      zIndex: props.zIndex,
      transform: `translateX(${props.offset[0] || 0}px) translateY(${props.offset[1] || 0}px)`
    }
  })
  const innerCircleClass = computed(() => {
    return [
      'yt-fab--inner-circle',
      `yt-fab--inner-circle-${props.size}`,
      {
        'yt-fab--inner-circle-active': hasPoppedUp.value
      }
    ]
  })
  const popMenuClass = computed(() => {
    return [
      'yt-fab--pop-menu',
      `yt-fab--pop-menu-${props.horizontal}`,
      {
        'yt-fab--pop-menu-active': hasPoppedUp.value
      }
    ]
  })

  defineOptions({
    name: 'YtFab'
  })
</script>

<template>
  <view
    :class="fabClass"
    :style="fabStyle"
  >
    <view
      :class="innerCircleClass"
      @click="handleFabClick"
    >
      <yt-icon
        name="Plus"
        width="100%"
        height="100%"
      />
    </view>
    <!-- pop-menu -->
    <view
      :class="popMenuClass"
      v-if="popMenu"
    >
      <view
        v-for="(item, index) in menuList"
        :key="index"
        class="yt-fab--pop-menu-item"
        @click="handleMenuItemClick($event, index)"
      >
        <yt-icon
          class="yt-fab--pop-menu-item-icon"
          v-if="iconMap[item.icon]"
          :name="item.icon"
          :size="9"
          :width="60"
          :height="60"
        />
        <image
          class="yt-fab--pop-menu-item-image"
          v-else
          :src="item.icon"
          mode="aspectFill"
        />
        <span class="yt-fab--pop-menu-item-text">{{ item.text }}</span>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_fab.scss';
  @use '../../styles/_themes.scss';
</style>
