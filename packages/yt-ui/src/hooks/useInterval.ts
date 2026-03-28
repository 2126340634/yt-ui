export function useInterval(
  callback: () => void,
  interval: number,
  options: { immediate?: boolean } = { immediate: false }
) {
  let timer: NodeJS.Timeout | null = null
  const clear = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const resume = () => {
    clear()
    timer = setInterval(callback, interval)
  }

  const pause = () => {
    clear()
  }

  if (options.immediate) {
    resume()
  }

  return { pause, resume, clear }
}
