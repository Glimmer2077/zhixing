export function formatDate(ms: number, timeZone?: string): string {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone,
  }).formatToParts(new Date(ms))

  const valueFor = (type: Intl.DateTimeFormatPartTypes): string => {
    const part = parts.find((item) => item.type === type)
    if (!part) {
      throw new Error(`Missing date part: ${type}`)
    }
    return part.value
  }

  return `${valueFor('year')}.${valueFor('month')}.${valueFor('day')}`
}
