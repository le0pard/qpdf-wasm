const UNIT_SIZING = 1024
const BYTE_UNITS = [
  'kB', 'MB', 'GB',
  'TB', 'PB', 'EB',
  'ZB', 'YB'
]

export const humanFileSize = (fileSizeInBytes) => {
  let i = -1

  do {
    fileSizeInBytes /= UNIT_SIZING
    i++
  } while (fileSizeInBytes > 1024)

  return [
    Math.max(fileSizeInBytes, 0.1).toFixed(1),
    BYTE_UNITS[i]
  ].join(' ')
}
