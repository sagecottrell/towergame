import type { uint } from '../types/RestrictedTypes.ts';
import type { SMap } from '../types/SMap.ts';
import images from './images.ts';
import type { ResourceMapRaw } from './resource-defs.ts';
import type { RoomIds } from './room-defs.ts';

export const FLOOR_DEFS_RAW = {
    buildables: {
        basic: {
            name: 'Basic',
            background: images.floors.BASIC_FLOOR_BG_PNG,
            cost_to_build: { coin: 10 },
            rooms: ['hotel-basic-small', 'ad-1', 'faceless-spawn', 'fire-room1', 'laser-room'],
            bookend_left: images.floors.BOOKEND_1_LEFT_PNG,
        },
        'express-lobby': {
            name: 'Express Lobby',
            background: images.floors.BASIC_FLOOR_BG_PNG,
            cost_to_build: { coin: 20 },
            rooms: [],
            bookend_left: images.floors.BOOKEND_1_LEFT_PNG,
        },
    },
    empty: {
        name: 'Empty',
        background: images.floors.EMPTY_FLOOR_BG_PNG,
        cost_to_build: { coin: 10 },
        rooms: [],
        bookend_left: images.floors.BOOKEND_1_LEFT_PNG,
    },
    roofs: {
        basic: {
            name: 'Roof 1',
            background: images.floors.ROOF1_PNG,
            cost_to_build: {},
        },
    },
    empty_roof: {
        name: 'Roof 1',
        background: images.floors.ROOF1_PNG,
        cost_to_build: {},
    },
    new_floor_size: [5 as uint, 5 as uint],
} as const satisfies FloorDefsRaw;

export type BUILDABLE_FLOOR_KINDS = keyof (typeof FLOOR_DEFS_RAW)['buildables'];

export interface FloorDefRaw {
    name: string;
    background: string;
    /**
     * @type integer
     */
    cost_to_build: ResourceMapRaw<number>;
    /**
     * @type integer
     */
    tier?: number;
    rooms?: RoomIds[];
    readme?: string;

    bookend_left?: string;
    bookend_right?: string;
}
export interface FloorDefsRaw {
    roofs: SMap<FloorDefRaw>;
    buildables: SMap<FloorDefRaw>;
    empty_roof: FloorDefRaw;
    empty: FloorDefRaw;
    new_floor_size: [uint, uint];
}
