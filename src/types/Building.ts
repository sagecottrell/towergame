import type { SaveFileActions } from '../events/SaveFileActions.ts';
import type { Floor } from './Floor.ts';
import type { NMap } from './NMap.ts';
import type { ResourceMap } from './ResourceDefinition.ts';
import type { int, uint } from './RestrictedTypes.ts';
import type { Room, RoomId } from './Room.ts';
import type { SMap } from './SMap.ts';
import type { TowerWorker } from './TowerWorker.ts';
import type { Transportation } from './Transportation.ts';
import { random } from 'lodash';

export type BuildingId = uint & { readonly _b_type: unique symbol };

/**
 * A single building representing one "franchise" or "run"
 */
export interface Building {
    name: string;
    id: BuildingId;
    position?: int;
    floors: Floor[];
    rooms: { [p: RoomId]: Room };
    top_floor: int;
    max_width: uint;
    transports: SMap<Transportation>;

    seed: number;
    rng_state: number;

    rating: uint;
    new_things_acked: SMap<string>;

    action_queue: [number, SaveFileActions][] | null;

    /**
     * milliseconds since the building was created
     */
    time_ms: number;
    time_per_day_ms: number;
    day_started: boolean;

    /**
     * The workers that are actively moving about the building. does not include any that are inside rooms.
     */
    workers: NMap<TowerWorker>;

    max_height: uint;
    max_depth: uint;

    wallet: ResourceMap<uint>;
    room_id_counter: number;
    worker_id_counter: number;
}

export function Default(items?: Partial<Building>): Building {
    const seed = random(1000);
    return {
        top_floor: 0 as int,
        floors: [],
        transports: {},
        max_width: 0 as uint,
        name: '',
        id: 0 as BuildingId,
        rating: 0 as uint,
        new_things_acked: {},
        time_ms: 0,
        time_per_day_ms: 5 * 60 * 1000,
        day_started: false,
        max_height: 0 as uint,
        max_depth: 0 as uint,
        workers: {},
        action_queue: [],
        wallet: {},
        rooms: {},
        room_id_counter: 0,
        worker_id_counter: 0,
        seed,
        rng_state: seed,
        ...items,
    };
}
