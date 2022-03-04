import * as github from './clients/index.js'
import { params } from './clients/index.js'
import { json } from "es-fetch-api/middlewares/body.js";
import { DELETE, POST, PUT } from "es-fetch-api/middlewares/methods.js";
import { decodeBase64, encodeBase64 } from "../../../../utils/encode.js";
import * as apiPath from "./api-path.js";

export const createOrgRepository = (owner, name) =>
    github.api(`orgs/:owner/repos`, POST, params({ owner }),
        json({ auto_init: true, default_branch: "main", name, private: false, template: false }))

export const getFile = async (owner, repo, filepath) => {
    const data = await github.api(apiPath.contents, params({ owner, repo, filepath }));
    if (data instanceof Array && !data.length) throw { status: 404, message: 'file not found' }
    return data
}


export const updateFile = (owner, repo, filepath, content, sha, operator) =>
    github.api(
        apiPath.contents,
        PUT,
        params({ owner, repo, filepath }),
        json({ content, sha, message: `${operator} updated ${filepath}` }))

export const createFile = (owner, repo, filepath, content, operator) =>
    github.api(
        apiPath.contents,
        POST,
        params({ owner, repo, filepath }),
        json({ content, message: `${operator} created ${filepath}` })
    )

export const saveFile = async (owner, repo, filepath, content, operator) => {
    let file
    const base64 = encodeBase64(content)
    try {
        file = await getFile(owner, repo, filepath)
    } catch (error) {
        if (error.status === 404) {
            await createFile(owner, repo, filepath, base64, operator)
        } else throw error
    }
    if (file?.sha) {
        await updateFile(owner, repo, filepath, base64, file.sha, operator)
    }
}

export const deleteFile = async (owner, repo, filepath, operator) => {
    let { sha } = await getFile(owner, repo, filepath)
    await github.api(
        apiPath.contents,
        DELETE,
        params({ owner, repo, filepath }), json({ sha, message: `${operator} deleted ${filepath}` }))
}

export const readFile = async (owner, repo, filepath) => {
    const { content } = await getFile(owner, repo, filepath)
    return decodeBase64(content)
}

export const getBlob = async (owner, repo, sha) =>
    github.api('repos/:owner/:repo/git/blobs/:sha', params({ owner, repo, sha }))

export const readAllDirectoryFiles = async (owner, repo, filepath) => {
    const queue = [ filepath ]
    const files = []
    while (queue.length) {
        const [ ...paths ] = queue
        queue.length = 0
        await Promise.all(paths.map(async currentPath => {
            const entries = await getFile(owner, repo, currentPath).catch(() => [])
            files.push(...entries.filter(({ type }) => type === 'file').map(({ path }) => path))
            queue.push(...entries.filter(({ type }) => type === 'dir').map(({ path }) => path))
        }))
    }
    return readFiles(owner, repo, ...files)
}

export const readFiles = async (owner, repo, ...paths) => Promise.all(paths.map(path => readFile(owner, repo, path)))

