import { isToday } from '../utils/date'

export type WeekDate = {
  date: number | string
  isCurWeek: boolean
  isToday: boolean
}[]

// start => 学期第一天xxxx-xx-xx, weeks => 总周数
export function useSchedule(start: string, weeks: number) {
  const weekDays = ['一', '二', '三', '四', '五', '六', '日']
  let startDate: Date | null = null
  const weekDateCache = new Map<number, WeekDate>() // 缓存已计算的周7天填充日期

  const init = () => {
    const match = start.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
    if (match) {
      const [_, year, month, date] = match
      startDate = new Date(Number(year), Number(month) - 1, Number(date))
    }
  }

  // 获取第week周的7天日期, week从1开始
  const getWeekDate = (week: number) => {
    if (!startDate || week < 1 || week > weeks) return []
    if (weekDateCache.has(week)) return weekDateCache.get(week)
    const result: WeekDate = []
    const isCurWeek = isCurrentWeek(week)
    // 新开一个开学第一天date对象 用于推算第week周的新date
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + (week - 1) * 7) // 第week周的第一天(星期一)date对象
    // 填充第week周的7天
    for (let i = 0; i < 7; i++) {
      const day = new Date(date)
      day.setDate(date.getDate() + i)
      const curDate = day.getDate()
      result.push({
        date: curDate === 1 ? `${day.getMonth() + 1}月` : curDate,
        isCurWeek,
        isToday: isToday(day)
      })
    }
    weekDateCache.set(week, result)
    return result
  }

  // 判断是否为当前周
  const isCurrentWeek = (week: number): boolean => {
    if (!startDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekStart = new Date(startDate)
    weekStart.setDate(startDate.getDate() + (week - 1) * 7)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    return today >= weekStart && today <= weekEnd
  }

  // 获取当前周起始日期是几月份
  const getMonthOfStartDate = (week: number) => {
    if (!startDate) return ''
    const today = new Date()
    const dayStart = new Date(startDate)
    dayStart.setDate(startDate.getDate() + (week - 1) * 7)
    return dayStart.getMonth() + 1
  }

  const clearCache = () => {
    weekDateCache.clear()
  }

  init()
  return { weekDays, getWeekDate, isCurrentWeek, getMonthOfStartDate, clearCache }
}
