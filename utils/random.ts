export const uid = (length = 8) => (Math.random() * 1e32).toString(36).slice(0, length)
