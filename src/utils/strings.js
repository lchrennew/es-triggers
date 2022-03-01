const pattern = /{{(?<name>[^}]+)}}/g

export const compile = (string = '') =>
    bindings => string.replaceAll(pattern, (_, name) => encodeURIComponent(bindings[name] ?? ''))
export const exec = (string, bindings) => string.replaceAll(pattern, (_, name) => encodeURIComponent(bindings[name] ?? ''))
