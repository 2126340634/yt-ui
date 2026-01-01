<script setup lang="ts">
  import { computed, CSSProperties, onUnmounted, ref, shallowRef, watch } from 'vue'
  import { ThemeColor } from '../../types/theme-types'
  import { useInterval } from '../../hooks/useInterval'

  interface Props {
    theme?: ThemeColor | 'none'
    disabled?: boolean
    showBgColor?: boolean
    list: any[]
    modelValue?: number | null
    width?: number | string
    height?: number | string
    direction?: 'horizontal' | 'vertical'
    duration?: number
    showArrow?: boolean
    arrowColor?: 'light' | 'dark'
    arrowSize?: number
    showDots?: boolean
    dotsSize?: number
    maxDots?: number
    dotsSide?: 'left' | 'right'
    dotsOffset?: number | string
    loop?: boolean
    autoplay?: boolean
    interval?: number
    type?: 'default' | 'card'
    activeCardScale?: number
    inactiveCardScale?: number
    cardGap?: number
    borderRadius?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    theme: 'none',
    disabled: false,
    showBgColor: false,
    list: () => [],
    modelValue: null,
    width: '100%',
    height: '100%',
    direction: 'horizontal',
    duration: 500,
    showArrow: false,
    arrowColor: 'light',
    arrowSize: 16,
    showDots: false,
    dotsSize: 32,
    maxDots: 7,
    dotsSide: 'right',
    dotsOffset: '15%',
    loop: true,
    autoplay: false,
    interval: 2000,
    type: 'default',
    activeCardScale: 0.8,
    inactiveCardScale: 0.6,
    cardGap: 25,
    borderRadius: 0
  })

  const { pause, resume, clear } = useInterval(
    () => {
      if (props.autoplay && !isAnimating && props.list.length > 1) {
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
    change: [index: number]
    'update:modelValue': [modelValue: number]
  }>()

  function handleClick(e: Event) {
    emit('click', e, realCurIndex.value)
  }

  // swiper
  const systemInfo = uni.getSystemInfoSync()
  const curIndex = ref(props.loop && props.list.length > 1 ? 1 : 0)
  const enableTransition = ref(true)
  let isAnimating = false
  let endAnimTimer: NodeJS.Timeout | null = null
  const MIN_SWIPE_THRESHOLD = 50
  // autoplay
  let resumeTimer: NodeJS.Timeout | null = null
  const touchState = shallowRef({
    startX: 0,
    startY: 0,
    isSwiping: false,
    direction: '' as 'horizontal' | 'vertical' | '',
    deltaX: 0,
    deltaY: 0
  })

  const maxSwiperDots = computed(() => {
    return Math.min(props.list.length, props.maxDots)
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
    return [
      'yt-swiper',
      `yt-swiper--theme-${props.showBgColor ? props.theme : 'none'}`,
      { 'yt-swiper--card': isCard.value }
    ]
  })
  const swiperStyle = computed(() => ({
    '--swiper-width': typeof props.width === 'number' ? `${props.width}px` : props.width,
    '--swiper-height': typeof props.height === 'number' ? `${props.height}px` : props.height,
    '--swiper-dots-offset':
      typeof props.dotsOffset === 'number' ? `${props.dotsOffset}%` : props.dotsOffset,
    '--swiper-border-radius':
      typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius
  }))
  const swiperContainerClass = computed(() => {
    return ['yt-swiper--container', `yt-swiper--container-${props.direction}`]
  })
  const swiperContainerStyle = computed(() => {
    return {
      '--swiper-translate-index': curIndex.value,
      '--swiper-translate-duration': enableTransition.value ? `${props.duration * 0.001}s` : '0s'
    }
  })
  const draggerTransform = ref('translate3d(0, 0, 0)')
  function updateDraggerTransform() {
    const { deltaX, deltaY } = touchState.value
    if (!touchState.value.isSwiping || props.disabled) {
      draggerTransform.value = 'translate3d(0, 0, 0)'
      return
    }
    const activeDeltaX = touchState.value.direction === 'horizontal' ? deltaX : 0
    const activeDeltaY = touchState.value.direction === 'vertical' ? deltaY : 0
    draggerTransform.value = isHorizontal.value
      ? `translate3d(${activeDeltaX}px, 0, 0)`
      : `translate3d(0, ${activeDeltaY}px, 0)`
  }
  const swipeThreshold = computed(() => {
    const threshold =
      (isHorizontal.value ? systemInfo.windowWidth / 3 : systemInfo.windowHeight / 3) ||
      MIN_SWIPE_THRESHOLD
    return Math.min(threshold, MIN_SWIPE_THRESHOLD)
  })
  const swiperDraggerStyle = computed(() => {
    return {
      transform: draggerTransform.value
    }
  })
  const swiperDraggerClass = computed(() => ({
    'yt-swiper--dragger': true,
    'yt-swiper--dragger-swiping': touchState.value.isSwiping
  }))
  const arrowStyle = computed(() => {
    return {
      flexDirection: (isHorizontal.value ? 'row' : 'column') as 'row' | 'column'
    }
  })
  const realCurIndex = computed(() => getRealIndex(curIndex.value))

  /**
   * swiper相关函数
   */
  function canAnimate() {
    return props.list.length && !isAnimating
  }
  function endAnim() {
    if (endAnimTimer) clearTimeout(endAnimTimer)
    endAnimTimer = setTimeout(() => {
      isAnimating = false
    }, props.duration)
  }
  async function handleLoopJump(targetIndex: number, wait: boolean = true) {
    const execute = async () => {
      enableTransition.value = false
      curIndex.value = targetIndex
      // 等待3帧 更新位置以及确保完成
      setTimeout(() => {
        enableTransition.value = true
        isAnimating = false
      }, 50)
    }
    if (wait) {
      setTimeout(async () => {
        await execute()
      }, props.duration)
    } else {
      await execute()
    }
  }
  function handlePrev() {
    if (!canAnimate()) return
    if (!props.loop && curIndex.value === 0) return
    if (props.disabled) return

    isAnimating = true
    curIndex.value--
    emit('change', realCurIndex.value)
    emit('update:modelValue', realCurIndex.value)
    if (props.loop) {
      if (curIndex.value === 0) {
        handleLoopJump(visibleList.value.length - 2)
      } else {
        endAnim()
      }
    } else {
      if (curIndex.value > 0) {
        setTimeout(() => {
          isAnimating = false
        }, props.duration)
      } else {
        isAnimating = false
      }
    }
  }
  function handleNext() {
    if (!canAnimate()) return
    if (!props.loop && curIndex.value === props.list.length - 1) return
    if (props.disabled) return

    isAnimating = true
    curIndex.value++
    emit('change', realCurIndex.value)
    emit('update:modelValue', realCurIndex.value)
    if (props.loop) {
      if (curIndex.value === visibleList.value.length - 1) {
        handleLoopJump(1)
      } else {
        endAnim()
      }
    } else {
      if (curIndex.value < props.list.length - 1) {
        setTimeout(() => {
          isAnimating = false
        }, props.duration)
      } else {
        isAnimating = false
      }
    }
  }
  const visibleList = shallowRef<any[]>([])
  watch(
    () => [props.list, props.loop] as const,
    ([list, loop]) => {
      if (!list.length) {
        visibleList.value = []
      } else if (loop && list.length > 1) {
        visibleList.value = [list[list.length - 1], ...list, list[0]]
      } else {
        visibleList.value = list // 直接引用
      }
    },
    { immediate: true }
  )
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
    const isAdjacent = index === curIndex.value + 1 || index === curIndex.value - 1
    const diff = index - curIndex.value
    const rotateType = isHorizontal.value ? 'rotateY' : 'rotateX'
    let translateValue = '0'
    if (index === curIndex.value + 1) translateValue = `-${props.cardGap}%`
    if (index === curIndex.value - 1) translateValue = `${props.cardGap}%`
    // transform
    const translate = isCurrentCard
      ? 'translate(0, 0)'
      : isHorizontal.value
      ? `translateX(${translateValue})`
      : `translateY(${translateValue})`
    const rotateValue = isCurrentCard ? '0deg' : `${diff * (isHorizontal.value ? -8 : 8)}deg`
    const translateZ = isCurrentCard ? '0px' : '-50px'
    const scale = isCurrentCard
      ? Math.min(props.activeCardScale, 1)
      : Math.min(props.inactiveCardScale, 1)
    const cardTransform = isCard.value
      ? `${translate} translateZ(${translateZ}) ${rotateType}(${rotateValue}) scale(${scale})`
      : 'none'
    // shadow
    const boxShadow =
      isCard.value && (isCurrentCard || isAdjacent)
        ? '0 2px 4px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.2)'
        : 'none'
    // border-radius
    const borderRadius =
      typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius

    return {
      '--swiper-container-item-transform': cardTransform,
      '--swiper-container-item-z-index': isCurrentCard ? '1' : '0',
      '--swiper-container-item-box-shadow': boxShadow,
      '--swiper-container-item-border-radius': borderRadius
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
  function shouldShow(displayIndex: number) {
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
   * autoplay,touch相关函数
   */
  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    touchState.value = {
      startX: touch.clientX,
      startY: touch.clientY,
      isSwiping: false,
      direction: '',
      deltaX: 0,
      deltaY: 0
    }
    pause()
  }
  function handleTouchMove(e: TouchEvent) {
    const touches = e.touches[0]
    const deltaX = touches.clientX - touchState.value.startX
    const deltaY = touches.clientY - touchState.value.startY
    let direction = touchState.value.direction
    if (!direction) {
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)
      if (absX < 5 && absY < 5) return
      direction = absX > absY ? 'horizontal' : 'vertical'
    }
    if (direction !== props.direction) return
    e.preventDefault()
    touchState.value = {
      ...touchState.value,
      direction,
      deltaX,
      deltaY,
      isSwiping: true
    }

    updateDraggerTransform()
  }
  function handleTouchEnd() {
    draggerTransform.value = 'translate3d(0, 0, 0)'

    // autoplay
    if (resumeTimer) {
      clearTimeout(resumeTimer)
      resumeTimer = null
    }
    if (!touchState.value.isSwiping) {
      if (props.autoplay) resume()
    } else {
      resumeTimer = setTimeout(() => {
        if (props.autoplay) resume()
        resumeTimer = null
      }, 500)
    }

    const { deltaX, deltaY } = touchState.value
    const isH = isHorizontal.value
    const threshold = swipeThreshold.value
    if (touchState.value.isSwiping) {
      if ((isH && deltaX < -threshold) || (!isH && deltaY < -threshold)) {
        handleNext()
      } else if ((isH && deltaX > threshold) || (!isH && deltaY > threshold)) {
        handlePrev()
      }
    }
    touchState.value = {
      startX: 0,
      startY: 0,
      isSwiping: false,
      direction: '',
      deltaX: 0,
      deltaY: 0
    }
  }
  /** */

  /**
   * dots相关函数
   */
  const dotsClass = computed(() => {
    return [
      'yt-swiper--dots',
      `yt-swiper--dots-${props.direction}`,
      {
        'yt-swiper--dots-vertical-left': !isHorizontal.value && props.dotsSide === 'left',
        'yt-swiper--dots-vertical-right': !isHorizontal.value && props.dotsSide === 'right'
      }
    ]
  })

  watch(
    () => props.modelValue,
    (newIndex: number | null) => {
      // 判断当前索引是否是emit更新又传进子组件来的，如果是则return，防止再次执行jump阻断动画播放
      if (newIndex === null || newIndex === realCurIndex.value) return
      let targetIndex = newIndex
      if (props.loop) targetIndex++
      const safeIndex = Math.min(visibleList.value.length - 1, Math.max(0, targetIndex))
      handleLoopJump(safeIndex, false)
    },
    { immediate: true }
  )

  onUnmounted(() => {
    if (resumeTimer) {
      clearTimeout(resumeTimer)
      resumeTimer = null
    }
    if (endAnimTimer) {
      clearTimeout(endAnimTimer)
      endAnimTimer = null
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
    <view
      :class="swiperDraggerClass"
      :style="swiperDraggerStyle"
    >
      <!-- Item Container -->
      <view
        :class="swiperContainerClass"
        :style="swiperContainerStyle"
      >
        <view
          class="yt-swiper--container-item"
          v-for="(item, index) in visibleList"
          :key="index"
          @click="handleClick"
          :style="getCardStyle(index)"
        >
          <view v-show="shouldShow(index)">
            <slot
              name="swiper-item"
              :item="item"
              :index="getRealIndex(index)"
            />
          </view>
        </view>
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

    <!-- Dots -->
    <view
      v-if="showDots"
      :class="dotsClass"
    >
      <yt-dots
        :theme="theme"
        :total="maxSwiperDots"
        :size="props.dotsSize"
        :activeIndex="realCurIndex"
        :direction="props.direction"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_swiper.scss';
  @use '../../styles/_themes.scss';
</style>
