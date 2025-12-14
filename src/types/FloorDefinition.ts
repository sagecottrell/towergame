import { FLOOR_DEFS_RAW, type FloorDefRaw } from '../content/floor-defs.ts';
import type { ResourceMap } from './ResourceDefinition.ts';
import { as_uint_or_default, type uint } from './RestrictedTypes.ts';
import type { RoomKind } from './RoomDefinition.ts';

/**
 * technically a number or string, but you should not inspect it at all, nor use it with any other types
 * @asType string
 */
export type FloorKind = string & { readonly __type: unique symbol };

export interface FloorDefinition {
    d: 'floor';

    id: FloorKind;
    name: string;
    background: string;
    cost_to_build: ResourceMap<uint>;
    tier: uint;

    bookend_left: string;
    bookend_right: string;

    readme: string;

    rooms: RoomKind[];
}

interface FloorDefs {
    roofs: { [p: FloorKind]: FloorDefinition };
    buildables: { [p: FloorKind]: FloorDefinition };
    empty_roof: FloorDefinition;
    empty: FloorDefinition;
    new_floor_size: [uint, uint];
}

export const FLOOR_DEFS: FloorDefs = {
    empty: def_from_raw('', FLOOR_DEFS_RAW.empty),
    buildables: Object.fromEntries(
        Object.entries(FLOOR_DEFS_RAW.buildables).map(([id, value]) => [id, def_from_raw(id, value)]),
    ),
    empty_roof: def_from_raw('', FLOOR_DEFS_RAW.empty_roof),
    roofs: Object.fromEntries(Object.entries(FLOOR_DEFS_RAW.roofs).map(([id, value]) => [id, def_from_raw(id, value)])),
    new_floor_size: FLOOR_DEFS_RAW.new_floor_size,
};

function def_from_raw(id: string, item: FloorDefRaw): FloorDefinition {
    return {
        d: 'floor',
        id: id as FloorKind,
        tier: as_uint_or_default(item.tier ?? 0),
        background: item.background,
        name: item.name,
        cost_to_build: Object.fromEntries(
            Object.entries(item.cost_to_build).map(([key, value]) => [key, as_uint_or_default(value)]),
        ),
        rooms: (item.rooms as RoomKind[]) ?? [],
        readme: item.readme ?? '',
        bookend_left: item.bookend_left ?? '',
        bookend_right: item.bookend_right ?? '',
    };
}
