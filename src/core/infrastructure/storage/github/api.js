import * as github from './clients/index.js'
import { useParams } from './clients/index.js'
import { json } from "es-fetch-api/middlewares/body.js";
import { DELETE, POST, PUT } from "es-fetch-api/middlewares/methods.js";
import { decodeBase64, encodeBase64 } from "../../../../utils/encode.js";
import * as apiPath from "./api-path.js";
import { query } from "es-fetch-api/middlewares/query.js";
import { getLogger } from 'koa-es-template';

const logger = getLogger('GITHUB API')

export const getFile = async (owner, repo, filepath) => {
    const data = await github.api(apiPath.contents, useParams({ owner, repo, filepath }));
    if (data instanceof Array && !data.length) throw { status: 404, message: 'file not found' }
    return data
}

export const updateFile = ({ owner, repo, filepath, content, sha, operator }) =>
    github.api(
        apiPath.contents,
        PUT,
        useParams({ owner, repo, filepath }),
        json({ content, sha, message: `${operator} updated ${filepath}` }))

export const createFile = ({ owner, repo, filepath, content, operator }) =>
    github.api(
        apiPath.contents,
        POST,
        useParams({ owner, repo, filepath }),
        json({ content, message: `${operator} created ${filepath}` })
    )

export const saveFile = async (owner, repo, filepath, content, operator) => {
    let file
    const base64 = encodeBase64(content)
    try {
        file = await getFile(owner, repo, filepath)
    } catch (getFileError) {
        if (getFileError.status === 404) {
            try {
                await createFile({ owner, repo, filepath, content: base64, operator })
            } catch (createFileError) {
                if (createFileError.status === 404) {
                    await updateFile({ owner, repo, filepath, content: base64, operator })
                } else throw createFileError
            }
        } else throw getFileError
    }
    if (file?.sha) {
        await updateFile({ owner, repo, filepath, content: base64, sha: file.sha, operator })
    }
}

export const deleteFile = async (owner, repo, filepath, operator) => {
    let { sha } = await getFile(owner, repo, filepath)
    await github.api(
        apiPath.contents,
        DELETE,
        useParams({ owner, repo, filepath }), json({ sha, message: `${operator} deleted ${filepath}` }))
}

export const readFile = async (owner, repo, filepath) => {
    const { content } = await getFile(owner, repo, filepath)
    return decodeBase64(content)
}

export const getBlob = async (owner, repo, sha) =>
    github.api(apiPath.blob, useParams({ owner, repo, sha }))

const getRepository = (owner, repo) => github.api('repos/:owner/:repo', useParams({ owner, repo }))

const getDefaultBranch = async (owner, repo) => {
    const { default_branch: defaultBranch } = await getRepository(owner, repo)
    return defaultBranch
}

export const getTree = (owner, repo, sha, recursive = true) =>
    github.api(apiPath.tree, useParams({ owner, repo, sha }), query({ recursive }))


const getRootTree = async (owner, repo) => {
    const defaultBranch = await getDefaultBranch(owner, repo)
    return getTree(owner, repo, defaultBranch)
}

const getTreeFiles = (tree, dir = '') => tree.tree.filter(({ type, path }) => type === 'blob' && path.startsWith(dir))

const readBlob = async (owner, repo, sha) => {
    const blob = await getBlob(owner, repo, sha)
    return decodeBase64(blob.content)
}

export const readTreeFiles = async (owner, repo, dir = '') => {
    const tree = await getRootTree(owner, repo)
    const treeFiles = await getTreeFiles(tree, dir)
    return await Promise.all(treeFiles.map(({ sha }) => readBlob(owner, repo, sha)))
}

export const getTreeFilePaths = async (owner, repo, dir = '') => {
    const tree = await getRootTree(owner, repo)
    const treeFiles = await getTreeFiles(tree, dir)
    return treeFiles.map(({ path }) => path)
}

export const readFiles = async (owner, repo, ...paths) => Promise.all(paths.map(path => readFile(owner, repo, path)))

