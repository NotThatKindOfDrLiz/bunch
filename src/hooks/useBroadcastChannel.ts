import { useEffect, useRef } from 'react'

type MessageHandler<T> = (data: T) => void

export const useBroadcastChannel = <T>(channelName: string, onMessage: MessageHandler<T>) => {
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    const channel = new BroadcastChannel(channelName)
    channelRef.current = channel
    const handler = (event: MessageEvent) => {
      onMessage(event.data as T)
    }
    channel.addEventListener('message', handler)
    return () => {
      channel.removeEventListener('message', handler)
      channel.close()
    }
  }, [channelName, onMessage])

  const send = (message: T) => {
    channelRef.current?.postMessage(message)
  }

  return { send }
}
