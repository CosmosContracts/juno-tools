export const getShortAddress = (address: string) => {
  return address.slice(0, 8).concat('.....') + address.substring(36)
}
