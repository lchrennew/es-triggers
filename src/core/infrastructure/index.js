const storage = process.env.MODEL_STORAGE ?? 'gitea'
const { save, remove, get, getAll, getAllByNames } = await import(`./${storage}/index.js`)
export {
    save, remove, get, getAll, getAllByNames,
}
