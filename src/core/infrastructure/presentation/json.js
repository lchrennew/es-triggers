import { DomainModel } from "../../domain/domain-model.js";

export const parse = content => JSON.parse(content)

/**
 *
 * @param domainModel {DomainModel}
 * @return {*}
 */
export const stringify = domainModel => JSON.stringify(domainModel)
