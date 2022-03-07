const pattern = /{{(?<name>[^}]+)}}/g

export const compile = (string = '') =>
    bindings => string.replaceAll(pattern, (_, name) => encodeURIComponent(bindings[name] ?? ''))
export const exec = (string, variables) => string.replaceAll(pattern, (_, name) => encodeURIComponent(variables[name] ?? ''))
