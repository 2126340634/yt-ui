<script setup lang="ts">
  import { computed, ComputedRef, onUnmounted, ref, shallowRef, toRaw, watch } from 'vue'
  import { useSchedule, WeekDate } from '../../hooks/useSchedule'
  import { getLessonCoordinates } from '../../utils/util'
  import { defaultColorList, editFormRules } from '../../configs/scheduleConfig'
  import { ThemeColor } from '../../types/theme-types'
  import { onHide, onShow } from '@dcloudio/uni-app'

  type LoadType = 'all' | 'course' | 'agenda'

  export interface CourseData {
    type: 'course' | 'agenda'
    name: string
    location?: string
    teacher?: string
    class?: string
    isConflict?: boolean // 课程是否与日程重叠
    style?: string // 缓存内联样式，减少字符串开销
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
    agendaChange: [agenda: Agenda[]]
  }>()

  const schedule = useSchedule(props.data.start, props.weeks)
  const curWeek = ref(props.activeWeek) // 当前选中周(索引0开始)
  const showWeek = ref(false)
  const enableAutoScrollWeek = ref(true)
  const selectedDay = ref<null | number>(null)
  const isPopping = ref(false)
  const editMode = ref(false)
  const editState = shallowRef({
    cycleRange: [] as string[][],
    cycle: '',
    time: ''
  })
  const selectedCourse = shallowRef<(CourseData & { weekIndex: number; gridIndex: number }) | null>(
    null
  )
  const hasPoppedUp = ref(false) // 手动触发popup前不渲染
  const localAgendas = shallowRef<Agenda[]>(JSON.parse(JSON.stringify(props.data.agenda)))

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
  const dateContainerClass = (index: number) => ({
    'yt-schedule--date-container': true,
    'yt-schedule--date-container-active': selectedDay.value === index,
    'yt-schedule--date-container-current-week': weekDate.value?.[index].isCurWeek,
    'yt-schedule--date-container-today': weekDate.value?.[index].isToday
  })

  let colorCache: Record<string, string> = {}
  let colorCounter = 0
  const COLOR_AGENDA = '#999'
  const weekMapsCache = shallowRef<Map<number, Map<string, CourseData>>>(new Map())
  function loadCourse(weekIndex: number) {
    if (weekMapsCache.value.has(weekIndex)) return
    const map = new Map<string, CourseData>()
    const week = weekIndex + 1
    const { course } = props.data
    const agenda = localAgendas.value
    // 填充当前周课表数据
    const fillCourse = () => {
      course.forEach(course => {
        if (course.z.includes(week)) {
          const key = `${course.x}-${course.y}`
          if (!colorCache[course.name]) {
            colorCache[course.name] = props.colorList[colorCounter++ % props.colorList.length]
          }
          // 内联样式缓存
          const color = colorCache[course.name]
          const delay = (course.y - 1) * 0.04
          const transform = props.animation ? 'translateY(15px) scale(0.1)' : 'none'
          const style = `--grid-item-box-color: ${color}; --grid-item-anim-delay: ${delay}s; --grid-item-box-transform: ${transform}`

          map.set(key, {
            type: 'course',
            name: course.name,
            location: course.location,
            teacher: course.teacher,
            class: course.class,
            style
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
            const color = COLOR_AGENDA
            const delay = (agenda.y - 1) * 0.04
            const transform = props.animation ? 'translateY(15px) scale(0.1)' : 'none'
            const style = `--grid-item-box-color: ${color}; --grid-item-anim-delay: ${delay}s; --grid-item-box-transform: ${transform}`
            map.set(key, {
              type: 'agenda',
              name: agenda.name,
              location: agenda.location,
              style
            })
          }
        }
      })
    }
    fillCourse()
    fillAgenda()
    const newCache = new Map(weekMapsCache.value)
    newCache.set(weekIndex, map)
    weekMapsCache.value = newCache
  }
  function hasCourses(weekIndex: number) {
    return !!weekMapsCache.value.get(weekIndex)?.size
  }
  // 缓存每一格坐标
  const gridCoords = computed(() => {
    return gridList.value.map((_, index) => getLessonCoordinates(index))
  })
  const courseClasses = computed(() => {
    return selectedCourse.value?.class?.split(',') || []
  })
  // 获取某一格课程
  function getCachedCourse(weekIndex: number, index: number) {
    const coord = gridCoords.value[index]
    const key = `${coord.x}-${coord.y}`
    return weekMapsCache.value.get(weekIndex)?.get(key) || null
  }
  function handleWeekClick(index: number) {
    enableAutoScrollWeek.value = false
    if (curWeek.value === index) return
    curWeek.value = index
    emit('change', index)
  }
  function handleDateClick(index: number) {
    if (selectedDay.value === index) selectedDay.value = null
    else selectedDay.value = index
  }
  function handleSwiperChange(index: number) {
    enableAutoScrollWeek.value = true
    if (curWeek.value === index) return
    emit('change', index)
  }
  function handleCourseClick(weekIndex: number, index: number) {
    hasPoppedUp.value = true // 渲染popup
    const course = getCachedCourse(weekIndex, index) as CourseData
    editMode.value = !course
    // 添加日程模式更新表单组件值
    if (editMode.value) {
      const week = weekIndex + 1
      const day = schedule.weekDays[index % 7]
      const lessonNum = Math.floor(index / 7) * 2 + 1
      const range = Array.from({ length: props.weeks }, (_, index) => `第${index + 1}周`)
      editState.value = {
        cycleRange: [range, range],
        cycle: `第${week}周 至 第${week}周`,
        time: `周${day} 第${lessonNum}-${lessonNum + 1}节`
      }
    }
    // 浅拷贝，确保内部无引用类型
    const item = {
      ...course,
      weekIndex,
      gridIndex: index
    }
    selectedCourse.value = {
      ...item
    }
    emit('courseClick', {
      ...item
    })
    isPopping.value = true
  }
  function handleCourseLongPress(weekIndex: number, index: number) {
    const course = getCachedCourse(weekIndex, index)
    if (course?.type !== 'agenda') return
    uni.showModal({
      title: '系统提示',
      content: '确定要删除该日程吗？',
      success: res => {
        if (!res.confirm) return
        const { x, y } = getLessonCoordinates(index)
        const week = weekIndex + 1
        const targetIndex = localAgendas.value.findIndex(
          agenda => agenda.x === x && agenda.y === y && agenda.z.includes(week)
        )
        if (targetIndex !== -1) {
          const targetAgenda = localAgendas.value[targetIndex]
          const newAgendas = [...localAgendas.value]
          newAgendas.splice(targetIndex, 1)
          localAgendas.value = newAgendas
          emit(
            'agendaChange',
            newAgendas.map(item => toRaw(item))
          )
          const newCache = new Map(weekMapsCache.value)
          targetAgenda.z.forEach(zWeek => {
            newCache.delete(zWeek - 1)
          })
          weekMapsCache.value = newCache
          lazyLoadCourses()
          uni.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  }
  // 选择日程周期
  function handleCyclePicked(value: number[]) {
    let [start, end] = [value[0] + 1, value[1] + 1]
    if (start > end) [start, end] = [end, start]
    editState.value = {
      ...editState.value,
      cycle: `第${start}周 至 第${end}周`
    }
  }
  function shouldRender(weekIndex: number) {
    return curWeek.value === weekIndex
  }
  const editFormRef = ref()
  function handleAddAgenda() {
    editFormRef.value.validate((validated: boolean) => {
      if (!validated || !selectedCourse.value) return
      const formData = editFormRef.value.submitForm()
      const { x, y } = getLessonCoordinates(selectedCourse.value.gridIndex)
      const zMatch = formData.cycleInput.match(/^第(\d+)周 至 第(\d+)周$/)
      const zStart = Number(zMatch[1])
      const zEnd = Number(zMatch[2])
      const z = Array.from({ length: zEnd - zStart + 1 }, (_, index) => zStart + index)
      const repeatWeeks = getAgendaRepeatWeeks(x, y, z)
      if (repeatWeeks.length) {
        let repeatStr = ''
        if (repeatWeeks.length > 5) {
          repeatWeeks.splice(5)
          repeatStr = repeatWeeks.join('、') + '...'
        } else {
          repeatStr = repeatWeeks.join('、')
        }
        const title = `第${repeatStr}周已存在日程，无法添加`
        uni.showToast({
          title,
          icon: 'none'
        })
        return
      }
      const agenda: Agenda = {
        type: 'agenda',
        name: formData.nameInput,
        location: formData.locationInput,
        x,
        y,
        z
      }
      const agendas = localAgendas.value.concat(agenda)
      localAgendas.value = agendas
      emit(
        'agendaChange',
        agendas.map(item => toRaw(item))
      )
      // 清除新日程所在周数的缓存，重新加载
      z.forEach(week => weekMapsCache.value.delete(week - 1))
      weekMapsCache.value = new Map(weekMapsCache.value)
      isPopping.value = false
      editFormRef.value.resetForm(['nameInput', 'locationInput'])
      if (zStart - 1 !== curWeek.value) {
        // 跳到创建日程的起始周，触发watch自动加载
        curWeek.value = zStart - 1
      } else {
        lazyLoadCourses()
      }
    })
  }
  // 获取与传入的日程重复的周数
  function getAgendaRepeatWeeks(x: number, y: number, z: number[]): number[] {
    const result: number[] = []
    const targetWeeks = new Set(z)
    localAgendas.value.forEach(agenda => {
      if (agenda.x === x && agenda.y === y) {
        agenda.z.forEach(existingWeek => {
          if (targetWeeks.has(existingWeek)) {
            result.push(existingWeek)
          }
        })
      }
    })
    return result.sort((a, b) => a - b)
  }
  function handleClearAgenda() {
    uni.showModal({
      title: '提示',
      content: '确定要清空所有日程吗？',
      success: res => {
        if (!res.confirm) return
        localAgendas.value = []
        emit('agendaChange', localAgendas.value)
        weekMapsCache.value = new Map()
        lazyLoadCourses()
        uni.showToast({ title: '清除成功', icon: 'success' })
      }
    })
  }
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
    weekMapsCache.value.clear()
  }

  // 课表数据变化重新加载
  watch(
    [() => props.data?.course, () => props.animation],
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
        :style="{
          pointerEvents: localAgendas.length ? 'auto' : 'none',
          opacity: localAgendas.length ? 1 : 0
        }"
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
                :class="gridItemBoxClass(weekIndex)"
                :style="getCachedCourse(weekIndex, index)?.style"
                @click="handleCourseClick(weekIndex, index)"
                @longpress="handleCourseLongPress(weekIndex, index)"
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
    <!-- popup -->
    <yt-popup
      v-if="hasPoppedUp"
      :headerType="editMode ? 'close-only' : 'none'"
      :headerProps="{ title: '自定义日程' }"
      :closeOnOverlayClick="!editMode"
      placement="center"
      v-model:visible="isPopping"
      height="fit-content"
      maxHeight="50vh"
    >
      <!-- preview -->
      <view
        v-if="!editMode"
        class="yt-schedule--popup-preview"
      >
        <!-- course -->
        <view
          v-if="selectedCourse?.type === 'course'"
          class="yt-schedule--popup-preview-course"
        >
          <view>课程 {{ selectedCourse?.name || '未知' }}</view>
          <view>地点 {{ selectedCourse?.location || '未知' }}</view>
          <view>教师 {{ selectedCourse?.teacher || '未知' }}</view>
          <view>
            班级 {{ courseClasses.length ? '' : '未知' }}
            <view
              v-if="courseClasses.length"
              v-for="className in courseClasses"
            >
              {{ className }}
            </view>
          </view>
        </view>
        <!-- divider-line -->
        <view
          v-if="selectedCourse?.isConflict"
          class="yt-schedule--popup-preview-divider"
        />
        <!-- agenda -->
        <view
          v-if="selectedCourse?.type === 'agenda' || selectedCourse?.isConflict"
          class="yt-schedule--popup-preview-agenda"
        >
          <view>日程 {{ selectedCourse?.name || '无' }}</view>
          <view>地点 {{ selectedCourse?.location || '无' }}</view>
        </view>
      </view>
      <!-- edit -->
      <yt-form
        v-else
        ref="editFormRef"
        :rules="editFormRules"
      >
        <view class="yt-schedule--popup-edit">
          <view class="yt-schedule--popup-edit-name">
            <view>日程</view>
            <yt-input
              name="nameInput"
              theme="classic"
              placeholder="请输入日程安排"
            />
          </view>
          <view class="yt-schedule--popup-edit-cycle">
            <view>周期</view>
            <yt-picker
              type="multi"
              @change="handleCyclePicked"
              :items="editState.cycleRange"
            >
              <yt-input
                name="cycleInput"
                theme="classic"
                disabled
                :value="editState.cycle"
              />
            </yt-picker>
          </view>
          <view class="yt-schedule--popup-edit-time">
            <view>时间</view>
            <yt-input
              name="timeInput"
              theme="classic"
              disabled
              :value="editState.time"
            />
          </view>
          <view class="yt-schedule--popup-edit-location">
            <view>地点</view>
            <yt-input
              name="locationInput"
              theme="classic"
              placeholder="请输入日程地点"
            />
          </view>

          <yt-button
            class="yt-schedule--popup-edit-submit"
            size="small"
            @click="handleAddAgenda"
          >
            添加日程
          </yt-button>
        </view>
      </yt-form>
    </yt-popup>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_schedule.scss';
  @use '../../styles/themes';
</style>
