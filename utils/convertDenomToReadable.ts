export const convertDenomToReadable = (amount: string | number | null) => {
  return Number(amount) / 1000000
}
