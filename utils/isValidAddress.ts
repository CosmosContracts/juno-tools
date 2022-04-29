// Validates a bech32 address
export function isValidAddress(address: string): boolean {
  const bech32Regex = /^[a-z]{1,83}[a-km-zA-HJ-NP-Z0-9]{39,59}$/im
  if (!address.length) {
    return false
  }
  return Boolean(bech32Regex.exec(address))
}
