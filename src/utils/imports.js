export const importNamespace = async script => await import(`data:text/javascript;utf-8,${script}`)
export const exportName = (name, script) => `export const ${name} = ${script}`
