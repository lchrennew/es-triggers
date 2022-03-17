const pattern = /{{(?:(?<expand>\.{3})|(?<encode>@))?(?<name>[^}]+)}}/g

const exec = (string, variables) =>
    string.replaceAll(pattern,
        (_, expand, encode, name) => {
            if (expand) return JSON.stringify(variables[name])
            if (encode) return encodeURIComponent(variables[name] ?? '')
            return variables[name] ?? ''
        })

export { exec }
