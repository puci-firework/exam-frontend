/**
 * 格式化日期 (yyyy-MM-dd)
 * @param {Date|number|string} timestamp
 * @returns {string}
 */
export function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化日期时间 (yyyy-MM-dd HH:mm)
 * @param {Date|number|string} timestamp
 * @returns {string}
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${formatDate(timestamp)} ${hours}:${minutes}`
}

/**
 * 格式化剩余时间（秒 → HH:mm:ss）
 */
export function formatTime(seconds) {
  if (seconds <= 0) return '00:00:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':')
}
