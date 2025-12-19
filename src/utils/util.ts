export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
) => {
  const { leading = true, trailing = true } = options
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastTime = 0

  const throttled = function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    const remaining = delay - (now - lastTime)
    if (lastTime == 0 || remaining <= 0) {
      if (leading) {
        lastTime = now
        return fn.apply(this, args)
      } else {
        timer = setTimeout(
          () => {
            lastTime = Date.now()
            return fn.apply(this, args)
          },
          remaining > 0 ? remaining : delay
        )
      }
    } else if (trailing) {
      timer = setTimeout(() => {
        lastTime = Date.now()
        fn.apply(this, args)
      }, remaining)
    }
  }

  throttled.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
  }

  return throttled as T & { cancel: () => void }
}

export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: { immediate?: boolean } = {}
) => {
  const { immediate = false } = options
  let timer: ReturnType<typeof setTimeout> | null = null

  const debounced = function (this: any, ...args: Parameters<T>) {
    if (immediate && !timer) fn.apply(this, args)
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      if (!immediate) fn.apply(this, args)
    }, delay)
  }
  debounced.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
  }

  return debounced as T & { cancel: () => void }
}
