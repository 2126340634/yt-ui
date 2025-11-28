<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { iconMap } from '../yt-icon/icon-map'
  import { ThemeColor } from '../../types/theme-types'

  interface Props {
    centerIcon?: string
    theme?: ThemeColor
    showText?: boolean
    list?: { text?: string; icon: string; activeIcon?: string }[]
    zIndex?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    centerIcon: '',
    theme: 'classic',
    showText: false,
    list: () => [],
    zIndex: 1000
  })

  function validateListLength(list: Array<any>) {
    if (list && list.length > 4) {
      console.warn('[YtTabbar] list长度不能超过4，将自动截断')
      return list.slice(0, 4)
    }
    return list
  }

  const validatedList = computed(() => {
    return validateListLength(props.list || [])
  })

  const emit = defineEmits<{
    tabbarChange: [e: any, activeIndex: number]
    centerClick: [e: any]
  }>()

  const activeIndex = ref(0)

  const tabbarContainerStyle = computed(() => {
    return {
      '--tabbar-container-padding': props.showText ? '8px 0' : '16px 0 0 0',
      '--tabbar-item-margin': props.centerIcon ? '24px' : '0',
      zIndex: Number(props.zIndex)
    }
  })

  const tabbarContainerClass = computed(() => {
    return ['yt-tabbar--container', `yt-tabbar--theme-${props.theme}`]
  })

  const centerIconClass = computed(() => {
    return ['yt-tabbar--item-center', `yt-tabbar--theme-${props.theme}`]
  })

  const centerIconStyle = computed(() => {
    return { zIndex: props.zIndex }
  })

  function handleClick(e: Event, index: number) {
    activeIndex.value = index
    emit('tabbarChange', e, index)
  }

  function handleCenterClick(e: Event) {
    emit('centerClick', e)
  }

  defineOptions({
    name: 'YtTabbar'
  })
</script>

<template>
  <!-- tabbar -->
  <view
    :class="tabbarContainerClass"
    :style="tabbarContainerStyle"
  >
    <view
      v-for="(item, index) in validatedList"
      :class="[
        'yt-tabbar--item',
        `yt-tabbar--item-index-${index}`,
        {
          'yt-tabbar--item-active': activeIndex === index
        }
      ]"
      @click="handleClick($event, index)"
    >
      <yt-icon
        v-if="
          activeIndex === index ? item.activeIcon && iconMap[item.activeIcon] : iconMap[item.icon]
        "
        :name="activeIndex === index ? item.activeIcon : item.icon"
        :fillColor="activeIndex === index ? '#333' : '#3e3e3e50'"
        class="yt-tabbar--icon"
        :size="36"
      />
      <img
        v-else
        :src="activeIndex === index ? item.activeIcon : item.icon"
        alt="ICON"
        class="yt-tabbar--image"
      />
      <span
        v-if="props.showText"
        class="yt-tabbar--text"
      >
        {{ item.text }}
      </span>
    </view>
  </view>
  <!-- centerIcon -->
  <view
    v-if="centerIcon"
    @click="handleCenterClick"
    :class="centerIconClass"
    :style="centerIconStyle"
  >
    <view class="yt-tabbar--item-center-inner">
      <yt-icon
        v-if="iconMap[centerIcon]"
        :name="centerIcon"
        class="yt-tabbar--item-center-inner-icon"
        :size="42"
        fillColor="#fff"
      />
      <img
        v-else
        :src="centerIcon"
        alt="ICON"
        class="yt-tabbar--item-center-inner-image"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_tabbar.scss';
  @use '../../styles/_themes.scss';
</style>
