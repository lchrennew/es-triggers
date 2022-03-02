import * as gitea from '../../../utils/gitea.js'
import { params } from '../../../utils/gitea.js'
import { json } from "es-fetch-api";
import { DELETE, POST, PUT } from "es-fetch-api/middlewares/methods.js";

export const createOrgRepository = (owner, name) =>
    gitea.api(`orgs/:owner/repos`, POST, params({ owner }),
        json({ auto_init: true, default_branch: "main", name, private: false, template: false }))

const fileEndpoint = `repos/:owner/:repo/contents/:filepath`;

export const getFile = (owner, repo, filepath) =>
    gitea.api(fileEndpoint, params({ owner, repo, filepath }))

export const updateFile = (owner, repo, filepath, content, sha, operator) =>
    gitea.api(
        fileEndpoint,
        PUT,
        params({ owner, repo, filepath }),
        json({ content, sha, message: `${operator} updated ${filepath}` }))

export const createFile = (owner, repo, filepath, content, operator) =>
    gitea.api(
        fileEndpoint,
        POST,
        params({ owner, repo, filepath }),
        json({ content, message: `${operator} updated ${filepath}` })
    )

export const saveFile = async (owner, repo, filepath, content, operator) => {
    let file
    try {
        file = await getFile(owner, repo, filepath)
    } catch (error) {
        if (error.status === 404) {
            await createFile(owner, repo, filepath, content, operator)
        } else throw error
    }
    if (file.sha) {
        await updateFile(owner, repo, filepath, content, file.sha, operator)
    }
}

export const deleteFile = async (owner, repo, filepath, operator) => {
    let { sha } = await getFile(owner, repo, filepath)
    await gitea.api(
        fileEndpoint,
        DELETE,
        params({ owner, repo, filepath }), json({ sha, message: `${operator} deleted ${filepath}` }))
}

export const readFile = async (owner, repo, filepath) =>
    gitea.api(`repos/:owner/:repo/raw/:filepath`,
        params({ owner, repo, filepath }))

export const getBlob = async (owner, repo, sha) =>
    gitea.api('repos/:owner/:repo/git/blobs/:sha', params({ owner, repo, sha }))

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

