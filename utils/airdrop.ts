export const getAirdropDate = (date: number, type: string | null) => {
  if (type === null) return '-'
  if (type === 'height') return date
  const d = new Date(date * 1000)
  return `${d.toLocaleDateString('en-US')} approx`
}
