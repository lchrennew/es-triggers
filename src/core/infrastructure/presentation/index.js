export const format = process.env.PRESENTATION_FORMAT ?? 'yaml'

const { parse, stringify } = await import(`./${format}.js`)

export const load = (content, type) => new type(parse(content))
export const dump = obj => stringify(obj)
