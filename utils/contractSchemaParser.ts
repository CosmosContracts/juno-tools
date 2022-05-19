import parseSchema from 'parse-cosmwasm-schema'

export const parse = async (schema: any) => {
  console.log(schema)
  const data = await parseSchema(schema)
  // console.log(data)
  console.log(processSchema(data))
  return processSchema(data)
}

const processSchema = (schema: any) => {
  if (!schema.value.members) return schema.value

  return Object.keys(schema.value.members).map((key) => {
    const item = schema.value.members[key]

    let data: any

    if (item.type === 'optional') data = processSchema(item.value.body)
    if (item.type === 'struct') data = processSchema(item)

    return { field: key, type: item.type, data }
  })
}
