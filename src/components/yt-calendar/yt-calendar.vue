<script setup lang="ts">
  import { computed, ref, shallowRef, toRaw } from 'vue'
  import { ThemeColor } from '../../types/theme-types'
  import { Calendar, useCalendar } from '../../hooks/useCalendar'
  import { throttle } from '../../utils/util'

  const monthNameMap: Record<number, string> = {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December'
  }

  type MonthData = {
    date: number
    extra: string
    isHoliday: boolean
  }[]

  interface Props {
    monthData?: MonthData
    loading?: boolean
    theme?: ThemeColor | 'none'
    width?: number | string
    height?: number | string
    gap?: number | string
    borderRadius?: number | string
    start?: string
    end?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    monthData: () => [],
    loading: false,
    theme: 'none',
    width: '100%',
    height: '100%',
    gap: 6,
    borderRadius: 10,
    start: '',
    end: ''
  })

  const emit = defineEmits<{
    change: [{ year: number; month: number }]
    dateClick: [{ year: number; month: number; date: number; index: number }]
  }>()

  const calendarClass = computed(() => {
    return ['yt-calendar', `yt-calendar--theme-${props.theme}`]
  })
  const calendarStyle = computed(() => {
    return {
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      height: typeof props.height === 'number' ? `${props.height}px` : props.height,
      '--calendar-item-gap': typeof props.gap === 'number' ? `${props.gap}px` : props.gap,
      borderRadius:
        typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius
    }
  })
  const calendarOpacity = computed(() => {
    if (!touchState.value.isDragging) return 1
    const value = 1 - Math.abs(touchState.value.curX - touchState.value.startX) * 0.012
    return Math.min(Math.max(0.1, value), 1)
  })
  const calendarGridClass = computed(() => {
    return (item: Calendar, index: number) => {
      const active =
        calendar.isToday(item.year, item.month, item.date) || index === selectedDate.value?.index
      const secondary =
        active && selectedDate.value !== null && item.date !== selectedDate.value.item.date
      return {
        'yt-calendar--body-grid-item': true,
        'yt-calendar--body-grid-item-today': active,
        'yt-calendar--body-grid-item-secondary': secondary,
        'yt-calendar--body-grid-item-prev-month': item.isPrevMonth,
        'yt-calendar--body-grid-item-next-month': item.isNextMonth
      }
    }
  })
  const arrowScale = computed(() => {
    if (!touchState.value.isDragging) return { leftScale: 1, rightScale: 1 }
    const deltaX = touchState.value.curX - touchState.value.startX
    const rightScale =
      deltaX < 0 ? 1 + Math.abs(touchState.value.curX - touchState.value.startX) * 0.012 : 1
    const leftScale =
      deltaX > 0 ? 1 + Math.abs(touchState.value.curX - touchState.value.startX) * 0.012 : 1
    return {
      leftScale: Math.min(Math.max(1, leftScale), 1.5),
      rightScale: Math.min(Math.max(1, rightScale), 1.5)
    }
  })

  const calendar = useCalendar()
  const date = ref<Date>(new Date())
  const state = ref({
    year: date.value.getFullYear(),
    month: date.value.getMonth() + 1
  })
  const touchState = shallowRef({
    curX: 0,
    curY: 0,
    startX: 0,
    startY: 0,
    isDragging: false
  })
  const selectedDate = ref<{ item: Calendar; index: number } | null>(null)

  const calendarData = computed(() => {
    return calendar.getCalendar(state.value.year, state.value.month)
  })
  const backgroundText = computed(() => {
    return `${monthNameMap[state.value.month].slice(0, 3)}.${state.value.month}`
  })
  function getExtra(item: Calendar) {
    const target = props.monthData.find(md => md.date === item.date && item.isCurMonth)
    return target?.extra || ''
  }
  function isHoliday(item: Calendar) {
    const target = props.monthData.find(md => md.date === item.date && item.isCurMonth)
    return target?.isHoliday
  }
  function changeMonth(type: 'prev' | 'next') {
    let newMonth = state.value.month
    let newYear = state.value.year
    newMonth += type === 'prev' ? -1 : 1
    if (newMonth === 0) {
      newMonth = 12
      newYear--
    } else if (newMonth === 13) {
      newMonth = 1
      newYear++
    }
    if (props.start) {
      const startArr = props.start.split('-')
      if (newYear === Number(startArr[0])) newMonth = Math.max(newMonth, Number(startArr[1]))
      newYear = Math.max(newYear, Number(startArr[0]))
    }
    if (props.end) {
      const endArr = props.end.split('-')
      if (newYear === Number(endArr[0])) newMonth = Math.min(newMonth, Number(endArr[1]))
      newYear = Math.min(newYear, Number(endArr[0]))
    }
    if (newYear === state.value.year && newMonth === state.value.month) return
    state.value = {
      year: newYear,
      month: newMonth
    }
    selectedDate.value = null
    emit('change', toRaw(state.value))
  }
  function handleDatePickerChange(str: any) {
    selectedDate.value = null
    const strArr = str.split('-')
    state.value.year = Number(strArr[0])
    state.value.month = Number(strArr[1])
    emit('change', toRaw(state.value))
  }
  function handleTouchStart(e: any) {
    if (props.loading) return
    const touches = e.touches[0]
    touchState.value = {
      ...touchState.value,
      startX: touches.clientX,
      startY: touches.clientY
    }
  }
  function handleTouchMove(e: TouchEvent) {
    if (props.loading) return
    e.preventDefault()
    const touches = e.touches[0]
    const absDeltaX = Math.abs(touchState.value.curX - touchState.value.startX)
    const absDeltaY = Math.abs(touchState.value.curY - touchState.value.startY)
    touchState.value = {
      ...touchState.value,
      curX: touches.clientX,
      curY: touches.clientY,
      isDragging: absDeltaX > 5 || absDeltaY > 5
    }
  }
  function handleTouchEnd() {
    const deltaX = touchState.value.curX - touchState.value.startX
    const deltaY = touchState.value.curY - touchState.value.startY
    if (touchState.value.isDragging && Math.abs(deltaX) > 80 && Math.abs(deltaY) < 50) {
      changeMonth(deltaX > 0 ? 'prev' : 'next')
    }
    touchState.value = {
      curX: 0,
      curY: 0,
      startX: 0,
      startY: 0,
      isDragging: false
    }
  }
  function handleDateClick(item: Calendar, index: number) {
    if (selectedDate.value !== null && selectedDate.value.index === index) return
    selectedDate.value = { item, index }
    emit('dateClick', { year: item.year, month: item.month, date: item.date, index })
  }

  defineOptions({
    name: 'YtCalendar'
  })
</script>

<template>
  <view
    :class="calendarClass"
    :style="calendarStyle"
  >
    <view class="yt-calendar--header">
      <view class="yt-calendar--header-month-text">
        <span class="yt-calendar--header-month-text-number">{{ state.month }}</span>
        <span class="yt-calendar--header-month-text-word">{{ monthNameMap[state.month] }}</span>
      </view>
      <view class="yt-calendar--header-year-month">
        <span
          @click="changeMonth('prev')"
          class="arrow-left"
        >
          {{ '<' }}
        </span>
        <!-- date-picker -->
        <yt-picker
          type="date"
          fields="month"
          @change="handleDatePickerChange"
          :start="start"
          :end="end"
        >
          <span>{{ `${state.year}年${state.month}月` }}</span>
        </yt-picker>
        <span
          @click="changeMonth('next')"
          class="arrow-right"
        >
          {{ '>' }}
        </span>
      </view>
    </view>
    <view
      class="yt-calendar--body"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchEnd"
    >
      <view class="yt-calendar--body-week">
        <span
          v-for="(day, index) in calendar.weekDays"
          :key="index"
        >
          {{ day }}
        </span>
      </view>
      <view
        :class="['yt-calendar--body-grid', { 'yt-calendar--body-grid-loading': props.loading }]"
      >
        <span
          v-for="(item, index) in calendarData"
          :key="index"
          :class="calendarGridClass(item, index)"
          @click="handleDateClick(item, index)"
        >
          <p class="yt-calendar--body-grid-item-date">{{ item.date }}</p>
          <p class="yt-calendar--body-grid-item-extra">
            {{ getExtra(item) }}
          </p>
          <p
            class="yt-calendar--body-grid-item-holiday"
            v-if="isHoliday(item)"
          >
            休
          </p>
        </span>
        <!-- background-text -->
        <span class="yt-calendar--body-grid-background-text">{{ backgroundText }}</span>
      </view>
      <!-- loading -->
      <yt-loading
        class="yt-calendar--body-loading"
        :theme="theme"
        :visible="loading"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_calendar.scss';
  @use '../../styles/_themes.scss';
  @use '../../styles/var' as var;

  .yt-calendar--body {
    opacity: v-bind(calendarOpacity);
  }

  .arrow-left {
    transform: scale(v-bind('arrowScale.leftScale'));
  }

  .arrow-right {
    transform: scale(v-bind('arrowScale.rightScale'));
  }
</style>
