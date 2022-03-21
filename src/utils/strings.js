const pattern = /\$(?:(?<expand>\.{3})|(?<encode>@))?(?<name>[^\$]+)\$/g
const objectPattern = /^\$\.{3}[^\$]+\$$/i

const exec = (string, variables) => {

    const replaced = string.replaceAll(pattern,
        (_, expand, encode, name) => {
            if (expand) return JSON.stringify(variables[name])
            if (encode) return encodeURIComponent(variables[name] ?? '')
            return variables[name] ?? ''
        })

    if (objectPattern.test(string)) return JSON.parse(replaced)
    return replaced

}
export { exec }
