export const format = process.env.PRESENTATION_FORMAT ?? 'yaml'

const { parse, stringify } = await import(`./${format}.js`)

export const load = (content, type) => {
    if (!content) return null
    const { name, metadata, spec } = parse(content)
    return new type(name, metadata, spec);
}
export const dump = obj => stringify(obj)
