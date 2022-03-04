const token = process.env.GITEA_TOKEN
export const auth = async (ctx, next) => {
    ctx.header('Authorization', `token ${token}`)
    return await next()
}

export const baseUrl = `${process.env.GITEA_API}/api/v1`
export const owner = process.env.GITEA_SHARED_OWNER
export const repo = process.env.GITEA_SHARED_REPO
