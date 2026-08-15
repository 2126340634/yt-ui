export interface Calendar {
  date: number
  month: number
  year: number
  isPrevMonth: boolean
  isCurMonth: boolean
  isNextMonth: boolean
}

import { getFirstDayofMonth, getDaysofMonth } from '../utils/date'

/**
 * @description 传入的month参数应为1-12
 */
export function useCalendar() {
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  const getCalendar = (year: number, month: number): Calendar[] => {
    const firstDay = getFirstDayofMonth(year, month) // 星期几 0-6
    const daysofLastMonth = getDaysofMonth(year, month - 1) // 上一月天数
    const daysofCurMonth = getDaysofMonth(year, month) // 当前月天数
    const calendar: Calendar[] = []
    const total = 42
    let lastYear = year
    let lastMonth = month - 1
    if (lastMonth === 0) {
      lastMonth = 12
      lastYear = year - 1
    }
    // 填充上一月剩余天数
    for (let i = firstDay - 1; i >= 0; i--) {
      calendar.push({
        date: daysofLastMonth - i,
        month: lastMonth,
        year: lastYear,
        isPrevMonth: true,
        isCurMonth: false,
        isNextMonth: false
      })
    }
    // 填充当前月
    for (let i = 1; i <= daysofCurMonth; i++) {
      calendar.push({
        date: i,
        month,
        year,
        isPrevMonth: false,
        isCurMonth: true,
        isNextMonth: false
      })
    }
    // 填充下一月
    let nextYear = year
    let nextMonth = month + 1
    if (nextMonth === 13) {
      nextMonth = 1
      nextYear = year + 1
    }
    const len = calendar.length
    for (let i = 1; i <= total - len; i++) {
      calendar.push({
        date: i,
        month: nextMonth,
        year: nextYear,
        isPrevMonth: false,
        isCurMonth: false,
        isNextMonth: true
      })
    }
    return calendar
  }

  const isToday = (year: number, month: number, date: number) => {
    const now = new Date()
    return year === now.getFullYear() && month === now.getMonth() + 1 && date === now.getDate()
  }

  return { weekDays, getCalendar, isToday }
}
