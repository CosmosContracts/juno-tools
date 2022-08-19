export const convertDenomToReadable = (amount: string | number | null, decimal = 6) => {
  return Number(amount) / Math.pow(10, decimal)
}
