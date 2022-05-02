export const ellipsis = <T, U>(check: T, val: U) => (typeof check === 'undefined' || check === null ? '...' : val)

export const truncateMiddle = (text: string, length: number, separator = '...') => {
  if (text.length <= length) return text

  const sepLen = separator.length
  const charsToShow = length - sepLen
  const frontChars = Math.ceil(charsToShow / 2)
  const backChars = Math.floor(charsToShow / 2)

  return text.substring(0, frontChars) + separator + text.substring(text.length - backChars)
}
