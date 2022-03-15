const pattern = /{{(?<expand>\.{3})?(?<name>[^}]+)}}/g

export const compile = (string = '') =>
    bindings => string.replaceAll(pattern, (_, name) => encodeURIComponent(bindings[name] ?? ''))
export const exec = (string, variables) => string.replaceAll(pattern, (_, expand, name) => {
    if (expand) return JSON.stringify(variables[name])
    return encodeURIComponent(variables[name] ?? '');
})
