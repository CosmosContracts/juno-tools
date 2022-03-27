export const ellipsis = <T, U>(check: T, val: U) =>
  typeof check == 'undefined' || check == null ? '...' : val
