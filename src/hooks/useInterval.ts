import { useEffect, useRef } from 'react'

type Callback = () => void

export const useInterval = (callback: Callback, delay: number | null) => {
  const savedCallback = useRef<Callback | null>(null)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const tick = () => savedCallback.current?.()
    const id = setInterval(tick, delay)
    return () => clearInterval(id)
  }, [delay])
}
