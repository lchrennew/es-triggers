import { query } from "es-fetch-api/middlewares/query.js";

const token = process.env.GITEE_TOKEN
export const auth = query({ access_token: token })
export const baseUrl = `${process.env.GITEE_API}/api/v5`
export const owner = process.env.GITEE_SHARED_OWNER
export const repo = process.env.GITEE_SHARED_REPO
