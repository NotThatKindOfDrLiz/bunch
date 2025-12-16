import { useEffect, useRef } from 'react'

type MessageHandler<T> = (data: T) => void

export const useBroadcastChannel = <T>(channelName: string, onMessage: MessageHandler<T>) => {
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    const channel = new BroadcastChannel(channelName)
    channelRef.current = channel
    console.log(`[BroadcastChannel] Opened channel: ${channelName}`)
    const handler = (event: MessageEvent) => {
      console.log(`[BroadcastChannel] Received on ${channelName}:`, event.data)
      onMessage(event.data as T)
    }
    channel.addEventListener('message', handler)
    return () => {
      channel.removeEventListener('message', handler)
      channel.close()
      console.log(`[BroadcastChannel] Closed channel: ${channelName}`)
    }
  }, [channelName, onMessage])

  const send = (message: T) => {
    if (!channelRef.current) {
      console.warn(`[BroadcastChannel] Channel ${channelName} not initialized, message not sent:`, message)
      return
    }
    console.log(`[BroadcastChannel] Sending on ${channelName}:`, message)
    channelRef.current.postMessage(message)
  }

  return { send }
}
