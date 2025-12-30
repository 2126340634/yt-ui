// 月份第一天为星期几
export const getFirstDayofMonth = (year: number, month: number) => {
  return new Date(year, month - 1, 1).getDay()
}
// 月份总天数
export const getDaysofMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate()
}

// 格式化日期
export const getFormattedDate = (year?: number, month?: number, date?: number) => {
  const parts = []
  if (year !== undefined) parts.push(year)
  if (month !== undefined) parts.push(month.toString().padStart(2, '0'))
  if (date !== undefined) parts.push(date.toString().padStart(2, '0'))
  return parts.join('-') || ''
}

// 格式化学年 25/26
export const getFormattedTermYear = (firstYear: number, secondYear: number) => {
  return `${firstYear.toString().slice(2)}/${secondYear.toString().slice(2)}`
}

export const isToday = (date: Date): boolean => {
  const today = new Date()
  return (
    today.getDate() === date.getDate() &&
    today.getMonth() === date.getMonth() &&
    today.getFullYear() === date.getFullYear()
  )
}
