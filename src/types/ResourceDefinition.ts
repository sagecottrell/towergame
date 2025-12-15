import { RESOURCE_DEFS_RAW, type ResourceDefRaw } from '../content/resource-defs.ts';

/**
 * technically a number or string, but you should not inspect it at all, nor use it with any other types
 * @asType string
 */
export type ResourceKind = string & { readonly __type: unique symbol };

export interface ResourceDefinition {
    kind: ResourceKind;
    sprite: string;
    display_name?: string;
}

export const RESOURCE_DEFS: {
    [p: ResourceKind]: ResourceDefinition;
} = Object.fromEntries(Object.entries(RESOURCE_DEFS_RAW).map(([key, value]) => [key, def_from_raw(key, value)]));

export type ResourceMap<T> = { [p: ResourceKind]: T };

function def_from_raw(id: string, raw: ResourceDefRaw): ResourceDefinition {
    return {
        kind: id as ResourceKind,
        sprite: raw.sprite,
        display_name: raw.display_name,
    };
}
