import type { ReactElement } from 'react';
import { ROOM_DEFS_RAW, RoomCategory, type RoomDefRaw } from '../content/room-defs.ts';
import type { ResourceMap } from './ResourceDefinition.ts';
import { as_uint_or_default, to_uint, type uint } from './RestrictedTypes.ts';
import type { TowerWorkerKind } from './TowerWorkerDefinition.ts';

/**
 * technically a number or string, but you should not inspect it at all, nor use it with any other types
 * @asType string
 */
export type RoomKind = string & { readonly __type: unique symbol };

export interface RoomDefinition {
    d: 'room';

    id: RoomKind;

    /**
     * @default 1
     * @optional
     */
    min_height: uint;
    /**
     * @default 1
     * @optional
     */
    max_height: uint;

    min_width: uint;
    max_width: uint;

    /**
     * the width can only be multiples of this number
     * @default min_width
     */
    width_multiples_of: uint;

    display_name: string;

    /**
     * @default null
     * @optional
     */
    sprite_active: string | undefined;
    sprite_empty: string;

    /**
     * @default null
     */
    sprite_active_night: string | undefined;
    /**
     * @default null
     */
    sprite_empty_night: string | undefined;

    cost_to_build(width: number, height: number): ResourceMap<uint>;

    build_thumb: string;

    readme: string;

    /**
     * what tier will unlock this room
     * @default 0
     */
    tier: uint;

    category: RoomCategory;
    overlay?: () => Promise<() => ReactElement>;

    upgrades: [to: RoomKind, cost: ResourceMap<uint>][];

    /**
     * If empty, production happens only once per day
     */
    resource_requirements: ResourceMap<uint>;
    production: ResourceMap<uint>;
    workers_required: { [p: TowerWorkerKind]: uint };

    // how many times per day will this room produce resources, assuming fully stocked?
    max_productions_per_day?: uint;

    // if true, then all outputs will be added to the tower wallet instead of the room storage
    produce_to_wallet: boolean;

    workers_produced: { [p: TowerWorkerKind]: uint };
}

export const ROOM_DEFS: {
    [p: RoomKind]: RoomDefinition;
} = Object.fromEntries(Object.entries(ROOM_DEFS_RAW).map(([id, value]) => [id, def_from_raw(id, value)]));

function def_from_raw(id: string, raw: RoomDefRaw): RoomDefinition {
    return {
        d: 'room',
        id: id as RoomKind,
        category: raw.category ?? RoomCategory.Room,
        cost_to_build: process_cost_to_build(raw),
        min_width: as_uint_or_default(raw.min_width),
        width_multiples_of: as_uint_or_default(raw.min_width),
        max_width: as_uint_or_default(raw.max_width ?? raw.min_width),
        tier: as_uint_or_default(raw.tier ?? 0),
        sprite_empty: raw.sprite_empty,
        min_height: as_uint_or_default(raw.min_height ?? 1),
        display_name: raw.display_name,
        max_height: as_uint_or_default(raw.max_height ?? 1),
        sprite_active_night: raw.sprite_active_night ?? '',
        sprite_empty_night: raw.sprite_empty_night ?? '',
        build_thumb: raw.build_thumb,
        sprite_active: raw.sprite_active,
        overlay: raw.overlay,
        resource_requirements: raw.resource_requirements ?? {},
        production: raw.production ?? {},
        workers_required: raw.workers_required ?? {},
        max_productions_per_day: raw.max_productions_per_day ? as_uint_or_default(raw.max_productions_per_day) : void 0,
        produce_to_wallet: raw.produce_to_wallet ?? false,
        workers_produced: raw.workers_produced ?? {},
        upgrades: (raw.upgrades as unknown as RoomDefinition['upgrades']) ?? [],
        readme: raw.readme ?? '',
    };
}

function process_cost_to_build(t: RoomDefRaw): RoomDefinition['cost_to_build'] {
    if (t.cost_to_build instanceof Function) {
        return t.cost_to_build;
    }
    const a = Object.fromEntries(
        Object.entries(t.cost_to_build).map(([key, value]) => [key, as_uint_or_default(value)]),
    );
    return (w, h) => {
        return Object.fromEntries(
            Object.entries(a).map(([key, a]) => [key, as_uint_or_default(a * to_uint((w * h) / t.min_width))]),
        );
    };
}
