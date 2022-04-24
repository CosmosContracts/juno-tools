const convert = (amount: string | number | null) => {
  return Number(amount) / 1000000
}

export default convert
