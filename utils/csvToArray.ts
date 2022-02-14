import { AccountProps } from './isValidAccountsFile'

const csvToArray = (str: string, delimiter = ','): Array<AccountProps> => {
  const headers = str.slice(0, str.indexOf('\n')).split(delimiter)
  const rows = str.slice(str.indexOf('\n') + 1).split('\n')

  const arr = rows.map(function (row) {
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
