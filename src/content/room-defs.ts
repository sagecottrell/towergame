import type { ReactElement } from 'react';
import type { ResourceKind } from '../types/ResourceDefinition.ts';
import type { uint } from '../types/RestrictedTypes.ts';
import type { SMap } from '../types/SMap.ts';
import images from './images.ts';
import type { ResourceMapRaw } from './resource-defs.ts';
import type { TOWER_WORKER_KINDS } from './tower-worker-defs.ts';

export enum RoomCategory {
    Room,
}

export const ROOM_DEFS_RAW = {
    'ad-1': {
        min_width: 4,
        min_height: 1,
        display_name: 'Advertisement',
        sprite_active: images.rooms.BESTVIEWEDCOMP_GIF,
        sprite_empty: images.rooms.BESTVIEWEDCOMP_GIF,
        cost_to_build: { bone: 10 },
        build_thumb: images.rooms.BESTVIEWEDCOMP_GIF,
        production: { coin: 5 },
        produce_to_wallet: true,
        readme: 'Earn some extra cash by watching this short video!',
    },
    'hotel-basic-small': {
        min_width: 2,
        display_name: 'Hotel Room',
        sprite_active: images.rooms.ROOM_HOTEL_BASIC_SMALL_OCCUPIED_PNG,
        sprite_empty: images.rooms.ROOM_HOTEL_BASIC_SMALL_EMPTY_PNG,
        cost_to_build: { coin: 50 },
        build_thumb: images.rooms.ROOM_HOTEL_BASIC_SMALL_EMPTY_PNG,
        production: { coin: 20 },
        workers_required: { faceless: 2 },
        max_productions_per_day: 1,
        produce_to_wallet: true,
    },
    'faceless-spawn': {
        min_width: 2,
        display_name: 'FacelessSpawn',
        sprite_empty: images.rooms.FACELESS_SPAWN_PNG,
        sprite_active: images.rooms.FACELESS_SPAWN_PNG,
        cost_to_build: { coin: 50 },
        build_thumb: images.rooms.FACELESS_SPAWN_PNG,
        workers_produced: { faceless: 10 },
        readme: 'Provides some workers',
    },
} as const satisfies SMap<RoomDefRaw>;

export interface RoomDefRaw {
    min_height?: number;
    max_height?: number;
    min_width: number;
    max_width?: number;
    display_name: string;
    sprite_active: string;
    sprite_empty: string;
    sprite_active_night?: string;
    sprite_empty_night?: string;
    build_thumb: string;
    tier?: number;
    category?: RoomCategory;
    overlay?: () => Promise<() => ReactElement>;

    readme?: string;

    cost_to_build: ResourceMapRaw<number> | ((width: uint, height: uint) => { [p: ResourceKind]: uint });

    /**
     * If empty, production happens only once per day
     */
    resource_requirements?: ResourceMapRaw<number>;
    production?: ResourceMapRaw<number>;
    workers_required?: { [p in TOWER_WORKER_KINDS]: number };
    max_productions_per_day?: number;

    // should this room produce directly to the tower's wallet?
    produce_to_wallet?: boolean;

    // how many workers are added to the building pool
    workers_produced?: { [p in TOWER_WORKER_KINDS]: number };

    upgrades?: [to: RoomIds, cost: ResourceMapRaw<number>][];
}
export type RoomIds = keyof typeof ROOM_DEFS_RAW;
