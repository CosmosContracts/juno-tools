import { AccountProps } from './isValidAccountsFile'

const csvToArray = (str: string, delimiter = ','): Array<AccountProps> => {
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
      const el = headers.reduce(function (object: any, header, index) {
        object[header] = values[index]
        return object
      }, {})
      return el
    })

  return arr
}

export default csvToArray