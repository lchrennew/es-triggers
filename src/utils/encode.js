export const encode = (content, sourceEncoding, targetEncoding) => Buffer.from(content, sourceEncoding).toString(targetEncoding)
export const encodeBase64 = content => encode(content, 'utf-8', 'base64')
export const decodeBase64 = content => encode(content, 'base64', 'utf-8')
