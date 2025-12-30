<script setup lang="ts">
  import { computed, ComputedRef, onUnmounted, ref, watch } from 'vue'
  import { useSchedule, WeekDate } from '../../hooks/useSchedule'
  import { getLessonCoordinates } from '../../utils/util'
  import { defaultColorList } from '../../configs/scheduleConfig'
  import { ThemeColor } from '../../types/theme-types'
  import { onHide, onShow } from '@dcloudio/uni-app'

  export interface CourseData {
    type: 'course' | 'agenda'
    name: string
    location?: string
    teacher?: string
    class?: string
    color?: string
    isConflict?: boolean // 课程是否与日程重叠
  }

  export interface Course extends CourseData {
    type: 'course'
    x: number // 横坐标 从1开始
    y: number // 纵坐标 从1开始
    z: number[] // 第i周 从1开始
  }

  export interface Agenda extends CourseData {
    type: 'agenda'
    x: number
    y: number
    z: number[]
  }

  export interface ScheduleData {
    term: number
    termYear: string
    start: string
    course: Course[]
    agenda: Agenda[]
  }

  export type TimeList = {
    first: { start: string; end: string }
    second: { start: string; end: string }
  }[]

  interface Props {
    theme?: ThemeColor
    width?: number | string
    height?: number | string
    animation?: boolean
    duration?: number
    rows?: number // 行数(课节数)
    weeks?: number // 周数
    activeWeek?: number // 默认选中的周(索引0开始)
    timeList?: TimeList
    colorList?: string[]
    data?: ScheduleData
  }

  const props = withDefaults(defineProps<Props>(), {
    theme: 'classic',
    width: '100vw',
    height: '100vh',
    animation: true,
    duration: 300,
    rows: 6,
    weeks: 20,
    activeWeek: 0,
    timeList: () => [],
    colorList: () => defaultColorList,
    data: () => ({
      term: 1,
      termYear: '',
      start: '',
      course: [],
      agenda: []
    })
  })

  const emit = defineEmits<{
    change: [weekIndex: number]
    courseClick: [course: CourseData & { weekIndex: number; gridIndex: number }]
  }>()

  const schedule = useSchedule(props.data.start, props.weeks)
  const curWeek = ref(props.activeWeek) // 当前选中周(索引0开始)
  const showWeek = ref(false)
  const enableAutoScrollWeek = ref(true)
  const selectedDay = ref<null | number>(null)
  const loading = ref(false)
  let loadingTimer: NodeJS.Timeout | null = null

  const weekDate: ComputedRef<WeekDate> = computed(() => {
    return schedule.getWeekDate(curWeek.value + 1) || []
  })
  const weekMonth: ComputedRef<number | ''> = computed(() => {
    return schedule.getMonthOfStartDate(curWeek.value + 1)
  })
  const weekList = computed(() => {
    return Array.from({ length: props.weeks }, (_, index) => index)
  })
  const gridList = computed(() => {
    return Array.from({ length: props.rows * 7 }, (_, index) => index)
  })
  const gridIndexes = computed(() => {
    if (selectedDay.value === null) {
      return gridList.value
    } else {
      const day = selectedDay.value // 0-6
      const indexes: number[] = []
      for (let row = 0; row < props.rows; row++) {
        indexes.push(day + row * 7)
      }
      return indexes // 选中天数单列索引
    }
  })
  const scheduleClass = computed(() => {
    return [
      'yt-schedule',
      `yt-schedule--theme-${props.theme}`,
      {
        'yt-schedule-show-week': showWeek.value,
        'yt-schedule-current-week': curWeek.value
      }
    ]
  })
  const scheduleStyle = computed(() => ({
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    '--grid-cols': selectedDay.value === null ? 7 : 1,
    '--grid-rows': props.rows
  }))
  const weekTextClass = (index: number) => ({
    'yt-schedule--week-text': true,
    'yt-schedule--week-text-active': curWeek.value === index
  })
  const gridItemBoxClass = (weekIndex: number) => {
    const isCurWeek = weekIndex === curWeek.value
    const animEnabled = props.animation
    return {
      'yt-schedule--table-grid-item-box': true,
      'yt-schedule--table-grid-item-box-active-anim': animEnabled && isCurWeek,
      'yt-schedule--table-grid-item-box-active': !animEnabled && isCurWeek
    }
  }
  const gridItemBoxStyle = (weekIndex: number, index: number) => {
    const course = getCachedCourse(weekIndex, index)
    if (!course) return null
    const row = Math.floor(index / 7) + 1
    return {
      '--grid-item-box-transform': props.animation ? 'translateY(15px) scale(0.1)' : 'none',
      '--grid-item-box-color': course.color,
      '--grid-item-anim-delay': `${(row - 1) * 0.04}s`
    }
  }
  const dateContainerClass = (index: number) => ({
    'yt-schedule--date-container': true,
    'yt-schedule--date-container-active': selectedDay.value === index,
    'yt-schedule--date-container-current-week': weekDate.value?.[index].isCurWeek,
    'yt-schedule--date-container-today': weekDate.value?.[index].isToday
  })

  let colorCache: Record<string, string> = {}
  let colorCounter = 0
  const COLOR_AGENDA = '#999'
  const weekMapsCache = ref<Map<number, Map<string, CourseData>>>(new Map())
  function loadCourse(weekIndex: number) {
    if (weekMapsCache.value.has(weekIndex)) return
    const map = new Map<string, CourseData>()
    const week = weekIndex + 1
    const { course, agenda } = props.data
    // 填充当前周课表数据
    const fillCourse = () => {
      course.forEach(course => {
        if (course.z.includes(week)) {
          const key = `${course.x}-${course.y}`
          if (!colorCache[course.name]) {
            colorCache[course.name] = props.colorList[colorCounter++ % props.colorList.length]
          }
          map.set(key, {
            type: 'course',
            name: course.name,
            location: course.location,
            teacher: course.teacher,
            class: course.class,
            color: colorCache[course.name]
          })
        }
      })
    }
    // 填充当前周日程数据
    const fillAgenda = () => {
      agenda.forEach(agenda => {
        if (agenda.z.includes(week)) {
          const key = `${agenda.x}-${agenda.y}`
          // 检测并标记冲突
          const item = map.get(key)
          if (item && item.type !== 'agenda') {
            map.set(key, { ...item, isConflict: true })
          } else {
            map.set(key, {
              type: 'agenda',
              name: agenda.name,
              location: agenda.location,
              color: COLOR_AGENDA
            })
          }
        }
      })
    }
    fillCourse()
    fillAgenda()
    weekMapsCache.value.set(weekIndex, map)
  }
  function hasCourses(weekIndex: number) {
    return !!weekMapsCache.value.get(weekIndex)?.size
  }
  // 缓存每一格坐标
  const gridCoords = computed(() => {
    return gridList.value.map((_, index) => getLessonCoordinates(index))
  })
  // 获取某一格课程
  function getCachedCourse(weekIndex: number, index: number) {
    const coord = gridCoords.value[index]
    const key = `${coord.x}-${coord.y}`
    return weekMapsCache.value.get(weekIndex)?.get(key)
  }
  function handleWeekClick(index: number) {
    enableAutoScrollWeek.value = false
    if (curWeek.value === index) return
    curWeek.value = index
    emit('change', index)
  }
  function handleDateClick(index: number) {
    if (loadingTimer) {
      clearTimeout(loadingTimer)
      loadingTimer = null
    }
    loading.value = true
    if (selectedDay.value === index) selectedDay.value = null
    else selectedDay.value = index
    loadingTimer = setTimeout(() => (loading.value = false), 100)
  }
  function handleSwiperChange(index: number) {
    enableAutoScrollWeek.value = true
    if (curWeek.value === index) return
    emit('change', index)
  }
  function handleCourseClick(weekIndex: number, index: number) {
    const course = getCachedCourse(weekIndex, index)
    if (!course) return
    emit('courseClick', {
      ...course,
      weekIndex,
      gridIndex: index
    })
  }
  function shouldRender(weekIndex: number) {
    return curWeek.value === weekIndex
  }
  function handleClearAgenda() {}
  // 加载三页数据
  function lazyLoadCourses() {
    const weeks = props.weeks
    const cur = curWeek.value
    const prev = (cur - 1 + weeks) % weeks
    const next = (cur + 1) % weeks
    for (let weekIndex of [cur, prev, next]) {
      loadCourse(weekIndex)
    }
  }
  // 清空所有缓存
  function clearCache() {
    colorCache = {}
    colorCounter = 0
    weekMapsCache.value.forEach(map => map.clear())
    weekMapsCache.value.clear()
  }

  // 课表数据变化重新加载
  watch(
    () => props.data?.course,
    () => {
      clearCache()
      lazyLoadCourses()
    },
    {
      deep: true,
      flush: 'post'
    }
  )

  // 加载当前三页数据
  watch(
    () => curWeek.value,
    () => {
      lazyLoadCourses()
    },
    { immediate: true, flush: 'post' }
  )

  onUnmounted(() => {
    if (loadingTimer) {
      clearTimeout(loadingTimer)
      loadingTimer = null
    }
    clearCache()
  })

  let isLeaving = false
  onShow(() => {
    if (isLeaving) {
      isLeaving = false
      lazyLoadCourses()
    }
  })

  // 小程序切换页面清理缓存，防止内存占用过大
  onHide(() => {
    isLeaving = true
    clearCache()
  })

  defineOptions({
    name: 'YtSchedule'
  })
</script>

<template>
  <view
    :class="scheduleClass"
    :style="scheduleStyle"
  >
    <!-- schedule-header -->
    <view
      class="yt-schedule--header"
      @click="showWeek = !showWeek"
    >
      <view
        class="yt-schedule--header-clear"
        @click.stop="handleClearAgenda"
      >
        清空日程
      </view>
      <view class="yt-schedule--header-time">
        <span class="yt-schedule--header-arrow-text">◂</span>
        <span>{{ data.termYear }}</span>
        <span>第{{ data.term }}学期</span>
        <span class="yt-schedule--header-time-week">{{ curWeek + 1 }}周</span>
        <span class="yt-schedule--header-arrow-text">▸</span>
      </view>
      <yt-icon
        class="yt-schedule--header-arrow"
        name="ArrowUp"
        :size="12"
        :width="60"
        :height="30"
      />
    </view>
    <!-- schedule-week -->
    <scroll-view
      scroll-x
      scroll-with-animation
      :scroll-into-view="enableAutoScrollWeek ? `${'week-' + curWeek}` : ''"
      :show-scrollbar="false"
      class="yt-schedule--week"
    >
      <view
        v-for="(i, index) in weeks"
        :id="'week-' + index"
        :key="index"
        :class="weekTextClass(index)"
        @click="handleWeekClick(index)"
      >
        第{{ i }}周
      </view>
    </scroll-view>
    <!-- schedule-date -->
    <view class="yt-schedule--date">
      <view class="yt-schedule--date-month">{{ weekMonth }}月</view>
      <view
        v-for="(day, index) in schedule.weekDays"
        :class="dateContainerClass(index)"
        @click="handleDateClick(index)"
      >
        <view class="yt-schedule--date-container-day">{{ day }}</view>
        <view class="yt-schedule--date-container-date">{{ weekDate?.[index].date || '' }}</view>
        <view class="yt-schedule--date-container-dot" />
      </view>
    </view>
    <!-- schedule-table -->
    <view class="yt-schedule--table">
      <!-- left-side-time-list -->
      <view class="yt-schedule--table-time">
        <template v-for="(i, index) in rows">
          <view class="yt-schedule--table-time-item">
            <view class="yt-schedule--table-time-item-title">{{ i * 2 - 1 }}</view>
            <view class="yt-schedule--table-time-item-subtitle">
              {{ timeList[index].first.start }}
            </view>
            <view class="yt-schedule--table-time-item-subtitle">
              {{ timeList[index].first.end }}
            </view>
          </view>
          <view class="yt-schedule--table-time-item">
            <view class="yt-schedule--table-time-item-title">{{ i * 2 }}</view>
            <view class="yt-schedule--table-time-item-subtitle">
              {{ timeList[index].second.start }}
            </view>
            <view class="yt-schedule--table-time-item-subtitle">
              {{ timeList[index].second.end }}
            </view>
          </view>
        </template>
      </view>
      <!-- lesson-grid -->
      <yt-swiper
        class="yt-schedule--table-swiper"
        v-model="curWeek"
        :list="weekList"
        :duration="duration"
        @change="handleSwiperChange"
      >
        <template #swiper-item="{ index: weekIndex }">
          <view
            class="yt-schedule--table-grid"
            v-if="shouldRender(weekIndex)"
          >
            <view
              class="yt-schedule--table-grid-item"
              v-for="index in gridIndexes"
              :key="`${weekIndex}-${index}`"
            >
              <view
                v-if="!!getCachedCourse(weekIndex, index)"
                :class="gridItemBoxClass(weekIndex)"
                :style="gridItemBoxStyle(weekIndex, index)"
                @click="handleCourseClick(weekIndex, index)"
              >
                <view class="yt-schedule--table-grid-item-name">
                  {{ getCachedCourse(weekIndex, index)?.name }}
                </view>
                <view class="yt-schedule--table-grid-item-location">
                  {{ getCachedCourse(weekIndex, index)?.location }}
                </view>
                <view
                  class="yt-schedule--table-grid-item-conflict"
                  v-if="getCachedCourse(weekIndex, index)?.isConflict"
                >
                  {{ '⚠' }}
                </view>
              </view>
            </view>
            <!-- empty-tip -->
            <view
              v-if="!hasCourses(weekIndex)"
              class="yt-schedule--table-grid-empty"
            >
              Empty
            </view>
          </view>
        </template>
      </yt-swiper>
    </view>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_schedule.scss';
  @use '../../styles/themes';
</style>
