<script setup lang="ts">
  import { computed, nextTick, onUnmounted, ref } from 'vue'
  import { ThemeColor } from '../../types/theme-types'
  import { useInterval } from '../../hooks/useInterval'

  interface Props {
    theme?: ThemeColor | 'none'
    list: any[]
    perWidth?: number | string
    perHeight?: number | string
    direction?: 'horizontal' | 'vertical'
    duration?: number
    showArrow?: boolean
    showDots?: boolean
    arrowColor?: 'light' | 'dark'
    arrowSize?: number
    loop?: boolean
    lazy?: boolean
    autoplay?: boolean
    interval?: number
    type?: 'default' | 'card'
    activeCardScale?: number
    inactiveCardScale?: number
    cardGap?: number
    rounded?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    theme: 'none',
    list: () => [],
    perWidth: '100vw',
    perHeight: '60vw',
    direction: 'horizontal',
    duration: 500,
    showArrow: true,
    showDots: true,
    arrowColor: 'light',
    arrowSize: 50,
    loop: true,
    lazy: true,
    autoplay: false,
    interval: 2000,
    type: 'default',
    activeCardScale: 0.8,
    inactiveCardScale: 0.6,
    cardGap: 25,
    rounded: false
  })

  const { pause, resume, clear } = useInterval(
    () => {
      if (props.autoplay && !isAnimating.value && props.list.length > 1) {
        if (!props.loop && curIndex.value === visibleList.value.length - 1) {
          curIndex.value = 0
          return
        }
        handleNext()
      }
    },
    props.interval,
    { immediate: props.autoplay }
  )

  const emit = defineEmits<{
    click: [e: Event, index: number]
  }>()

  function handleClick(e: Event, index: number) {
    emit('click', e, index)
  }

  // swiper
  const curIndex = ref(props.loop && props.list.length > 1 ? 1 : 0)
  const enableTransition = ref(true)
  const isAnimating = ref(false)
  // autoplay
  const resumeTimer = ref<NodeJS.Timeout | null>(null)
  const touchState = ref({
    startX: 0,
    startY: 0,
    isSwiping: false
  })

  const isHorizontal = computed(() => {
    return props.direction === 'horizontal'
  })
  const isArrowDark = computed(() => {
    return props.arrowColor === 'dark'
  })
  const isCard = computed(() => {
    return props.type === 'card'
  })
  const swiperClass = computed(() => {
    return ['yt-swiper', { 'yt-swiper--card': isCard.value }]
  })
  const swiperStyle = computed(() => {
    return {
      width: typeof props.perWidth === 'number' ? `${props.perWidth}px` : props.perWidth,
      height: typeof props.perHeight === 'number' ? `${props.perHeight}px` : props.perHeight,
      borderRadius: props.rounded ? '20px' : '0'
    }
  })
  const swiperContainerClass = computed(() => {
    return ['yt-swiper--container', `yt-swiper--container-${props.direction}`]
  })
  const swiperContainerStyle = computed(() => {
    return {
      '--swiper-translate-index': curIndex.value,
      '--swiper-translate-duration': enableTransition.value ? `${props.duration * 0.001}s` : '0s'
    }
  })
  const arrowStyle = computed(() => {
    return {
      flexDirection: (isHorizontal.value ? 'row' : 'column') as 'row' | 'column'
    }
  })

  /**
   * swiper相关函数
   */
  function canAnimate() {
    return props.list.length && !isAnimating.value
  }
  function endAnim() {
    setTimeout(() => {
      isAnimating.value = false
    }, props.duration)
  }
  function handleLoopJump(targetIndex: number) {
    setTimeout(async () => {
      enableTransition.value = false
      await nextTick() // 等待以上执行完成
      curIndex.value = targetIndex
      await new Promise(resolve => setTimeout(resolve, 50)) // 等待3帧 更新位置以及确保完成
      enableTransition.value = true
      isAnimating.value = false
    }, props.duration)
  }
  function handlePrev() {
    if (!canAnimate()) return
    isAnimating.value = true
    curIndex.value--
    if (props.loop) {
      if (curIndex.value === 0) {
        handleLoopJump(visibleList.value.length - 2)
      } else {
        endAnim()
      }
    } else {
      if (curIndex.value > 0) {
        setTimeout(() => {
          isAnimating.value = false
        }, props.duration)
      } else {
        isAnimating.value = false
      }
    }
  }
  function handleNext() {
    if (!canAnimate()) return
    isAnimating.value = true
    curIndex.value++
    if (props.loop) {
      if (curIndex.value === visibleList.value.length - 1) {
        handleLoopJump(1)
      } else {
        endAnim()
      }
    } else {
      if (curIndex.value < props.list.length - 1) {
        setTimeout(() => {
          isAnimating.value = false
        }, props.duration)
      } else {
        isAnimating.value = false
      }
    }
  }
  const visibleList = computed(() => {
    const length = props.list.length
    if (!length) return []
    if (props.loop && length > 1) {
      return [props.list[length - 1], ...props.list, props.list[0]]
    }
    return props.list
  })
  function getRealIndex(displayIndex: number) {
    if (!props.loop || props.list.length <= 1) {
      return displayIndex
    }
    if (displayIndex === 0) return props.list.length - 1
    if (displayIndex === visibleList.value.length - 1) return 0
    return displayIndex - 1
  }
  function getCardStyle(index: number) {
    const isCurrentCard = isCurrentActive(index)
    // transform
    const translateValue =
      index === curIndex.value + 1
        ? -props.cardGap
        : index === curIndex.value - 1
        ? props.cardGap
        : '0'
    const diff = index - curIndex.value
    const rotateType = isHorizontal.value ? 'rotateY' : 'rotateX'
    const rotateValue = isCurrentCard ? '0deg' : `${diff * (isHorizontal.value ? -8 : 8)}deg`
    const cardTransform = `${
      isCurrentCard
        ? 'translate(0, 0)'
        : isHorizontal.value
        ? `translateX(${translateValue}%)`
        : `translateY(${translateValue}%)`
    } translateZ(${isCurrentCard ? '0px' : '-50px'}) ${rotateType}(${rotateValue}) scale(${
      isCurrentCard ? Math.min(props.activeCardScale, 1) : Math.min(props.inactiveCardScale, 1)
    })`
    // shadow
    const shadowValue =
      isCurrentCard || index === curIndex.value + 1 || index === curIndex.value - 1
        ? '0 2px 4px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.2)'
        : 'none'
    return {
      transform: isCard.value ? cardTransform : 'none',
      zIndex: index === curIndex.value ? '1' : '0',
      boxShadow: shadowValue
    }
  }
  function isCurrentActive(index: number) {
    return (
      index === curIndex.value ||
      (curIndex.value === visibleList.value.length - 1 && index === 1) ||
      (curIndex.value === 0 && index === visibleList.value.length - 2)
    )
  }
  const arrowVisible = computed(() => {
    if (props.list.length <= 1) return { start: false, end: false }
    if (props.loop) return { start: true, end: true }
    const start = curIndex.value !== 0
    const end = curIndex.value !== props.list.length - 1
    return { start, end }
  })
  // lazy
  const shouldRender = (displayIndex: number) => {
    if (!props.lazy) return true
    const current = curIndex.value
    const total = visibleList.value.length
    // 当前页面
    if (displayIndex === current) return true
    // 相邻页面
    if (Math.abs(displayIndex - current) === 1) return true
    // 循环边界相邻
    if (props.loop && props.list.length > 1) {
      return (
        (current === 0 && (displayIndex === total - 1 || displayIndex === total - 2)) ||
        (current === total - 1 && (displayIndex === 0 || displayIndex === 1))
      )
    }
    return false
  }
  /** */

  /**
   * autoplay相关函数
   */
  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    touchState.value = {
      startX: touch.clientX,
      startY: touch.clientY,
      isSwiping: false
    }
    pause()
  }
  function handleTouchMove(e: TouchEvent) {
    if (!touchState.value.startX) return
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchState.value.startX
    const deltaY = touch.clientY - touchState.value.startY
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      touchState.value.isSwiping = true
    }
  }
  function handleTouchEnd() {
    if (resumeTimer.value) {
      clearTimeout(resumeTimer.value)
      resumeTimer.value = null
    }
    if (!touchState.value.isSwiping) {
      if (props.autoplay) resume()
    } else {
      resumeTimer.value = setTimeout(() => {
        if (props.autoplay) resume()
        resumeTimer.value = null
      }, 500)
    }
    touchState.value.isSwiping = false
  }
  /** */

  onUnmounted(() => {
    if (resumeTimer.value) {
      clearTimeout(resumeTimer.value)
      resumeTimer.value = null
    }
    clear() // clear useInterval()
  })

  defineOptions({
    name: 'YtSwiper'
  })
</script>

<template>
  <view
    :class="swiperClass"
    :style="swiperStyle"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
  >
    <!-- Swiper Container -->
    <view
      :class="swiperContainerClass"
      :style="swiperContainerStyle"
    >
      <view
        class="yt-swiper--container-item"
        v-for="(item, index) in visibleList"
        @click="handleClick($event, getRealIndex(index))"
        :style="getCardStyle(index)"
      >
        <template v-if="shouldRender(index)">
          <slot
            :item="item"
            :index="getRealIndex(index)"
          />
        </template>
      </view>
    </view>

    <!-- Arrow -->
    <view
      v-if="showArrow"
      class="yt-swiper--arrow"
      :style="arrowStyle"
    >
      <yt-icon
        v-if="isHorizontal && arrowVisible.start"
        class="yt-swiper--arrow-left"
        :name="isArrowDark ? 'ArrowLeft' : 'ArrowLeftWhite'"
        :size="arrowSize"
        @click="handlePrev"
      />
      <yt-icon
        v-if="isHorizontal && arrowVisible.end"
        class="yt-swiper--arrow-right"
        :name="isArrowDark ? 'ArrowRight' : 'ArrowRightWhite'"
        :size="arrowSize"
        @click="handleNext"
      />
      <yt-icon
        v-if="!isHorizontal && arrowVisible.start"
        class="yt-swiper--arrow-up"
        :name="isArrowDark ? 'ArrowUp' : 'ArrowUpWhite'"
        :size="arrowSize"
        @click="handlePrev"
      />
      <yt-icon
        v-if="!isHorizontal && arrowVisible.end"
        class="yt-swiper--arrow-down"
        :name="isArrowDark ? 'ArrowDown' : 'ArrowDownWhite'"
        :size="arrowSize"
        @click="handleNext"
      />
    </view>
    <!-- <view
      v-if="showDots"
      class="yt-swiper--dots"
    /> -->
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_swiper.scss';
</style>
