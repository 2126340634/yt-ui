<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { iconMap } from '../yt-icon/icon-map'
  import { ThemeColor } from '../../types/theme-types'

  interface Props {
    modelValue?: number
    centerIcon?: string
    centerBgColor?: string
    centerBgColorLast?: string
    theme?: ThemeColor
    showText?: boolean
    list?: { text?: string; icon: string; activeIcon?: string }[]
    zIndex?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: 0,
    centerIcon: '',
    centerBgColor: '#ffffff20',
    centerBgColorLast: '#000',
    theme: 'classic',
    showText: false,
    list: () => [],
    zIndex: 500
  })

  function validateListLength(list: Array<any>) {
    if (list) {
      if (list.length > 4) {
        console.warn('[YtTabbar] list长度不能超过4，将自动截断')
        return list.slice(0, 4)
      }
      if (list.length < 4) {
        console.warn('[YtTabbar] list长度不能少于4')
        return Array.from({ length: 4 }, () => ({ icon: '' }))
      }
    }
    return list
  }

  const validatedList = computed(() => {
    return validateListLength(props.list || [])
  })

  const emit = defineEmits<{
    change: [e: Event, activeIndex: number]
    'update:modelValue': [activeIndex: number]
    centerClick: [e: Event]
  }>()

  const activeIndex = ref(props.modelValue)

  const tabbarContainerStyle = computed(() => {
    return {
      '--tabbar-container-padding': props.showText ? '8px 0' : '16px 0 0 0',
      '--tabbar-item-margin': props.centerIcon ? '30px' : '0',
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

  const centerInnerStyle = computed(() => {
    return {
      transform: `translateY(-${activeIndex.value * 48}px)`,
      '--tabbar-center-item-bgColor':
        activeIndex.value === 4 ? props.centerBgColorLast : props.centerBgColor
    }
  })

  function handleClick(e: Event, index: number) {
    if (index === activeIndex.value) return
    activeIndex.value = index
    emit('change', e, index)
    emit('update:modelValue', index)
  }

  function handleCenterClick(e: Event) {
    if (activeIndex.value === 4) return
    activeIndex.value = 4
    emit('centerClick', e)
    emit('update:modelValue', 4)
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
      :key="index"
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
        class="yt-tabbar--icon"
        :size="9"
      />
      <image
        v-else
        :src="activeIndex === index ? item.activeIcon : item.icon"
        class="yt-tabbar--image"
        mode="aspectFit"
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
      <view
        class="yt-tabbar--item-center-inner-items"
        :style="centerInnerStyle"
      >
        <template
          v-for="(item, index) in validatedList"
          :key="index"
        >
          <yt-icon
            v-if="iconMap[item.icon]"
            :name="item.icon"
            class="yt-tabbar--item-center-inner-icon"
            :size="10"
            width="100%"
            height="100%"
          />
          <image
            v-else
            :src="item.icon"
            mode="aspectFill"
            class="yt-tabbar--item-center-inner-image"
          />
        </template>
        <yt-icon
          v-if="iconMap[centerIcon]"
          :name="centerIcon"
          class="yt-tabbar--item-center-inner-icon"
          :size="10"
          width="100%"
          height="100%"
        />
        <image
          v-else
          :src="centerIcon"
          mode="aspectFill"
          class="yt-tabbar--item-center-inner-image"
        />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_tabbar.scss';
  @use '../../styles/_themes.scss';
</style>
