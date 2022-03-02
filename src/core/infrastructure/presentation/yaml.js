import { DomainModel } from "../../domain/domain-model.js";
import { dump, load } from "js-yaml";

export const parse = content => load(content)

/**
 *
 * @param domainModel {DomainModel}
 * @return {*}
 */
export const stringify = domainModel => dump(domainModel)
