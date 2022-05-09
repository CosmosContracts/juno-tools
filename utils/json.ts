export function parseJson<T = any>(input: string) {
  try {
    return JSON.parse(input) as T
  } catch {
    return null
  }
}
