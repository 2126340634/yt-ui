// 月份第一天为星期几
export const getFirstDayofMonth = (year: number, month: number) => {
  return new Date(year, month - 1, 1).getDay()
}
// 月份总天数
export const getDaysofMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate()
}
