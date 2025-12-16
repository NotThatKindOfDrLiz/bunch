export const formatSats = (value: number) => `${value.toLocaleString()} sats`

export const formatDateTime = (timestamp: number) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp)

export const pluralize = (count: number, singular: string, plural?: string) => {
  if (count === 1) return singular
  return plural ?? `${singular}s`
}
