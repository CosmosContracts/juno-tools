import type { AccountProps } from './isValidAccountsFile'

export const csvToArray = (str: string, delimiter = ',') => {
  let newline = '\n'
  if (str.includes('\r')) newline = '\r'
  if (str.includes('\r\n')) newline = '\r\n'

  const headers = str.slice(0, str.indexOf(newline)).split(delimiter)
  if (headers.length !== 2) {
    throw new Error('Invalid accounts file')
  }
  if (headers[0] !== 'address' || headers[1] !== 'amount') {
    throw new Error('Invalid accounts file')
  }

  const rows = str.slice(str.indexOf('\n') + 1).split(newline)

  const arr = rows
    .filter((row) => row !== '')
    .map((row) => {
      const values = row.split(delimiter)
      const el = headers.reduce((object, header, index) => {
        // @ts-expect-error assume object as Record<string, unknown>
        object[header] = values[index]
        return object
      }, {})
      return el
    })

  return arr as AccountProps[]
}
