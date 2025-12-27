import type {ResourceMap} from './ResourceDefinition.ts';
import type { int, uint } from './RestrictedTypes.ts';
import type { RoomId } from './Room.ts';
import type { TowerWorkerKind } from './TowerWorkerDefinition.ts';

export type TowerWorkerId = number & { readonly __type: unique symbol };

export interface TowerWorker {
    id: TowerWorkerId;
    kind: TowerWorkerKind;
    source_room_id: RoomId | null;
    position: [floor: int, pos: number];
    destination: [floor: int, pos: int];
    destination_room_id: RoomId | null;
    // used if the destination is on a different floor
    next_step: [floor_to_get_off: int, pos_of_transport: int] | null;
    stats: WorkerStats | null;
}

export interface WorkerStats {
    capacity: uint;
    payload: ResourceMap<uint>;
    speed: number;
    status: 'working' | 'confused' | 'angry';
    // failure to pathfind to the destination accrues confusion.
    // too much confusion will result in the worker returning resources to the source, and despawning
    confusion: number;
}

export function Default(): TowerWorker {
    return {
        id: 0 as TowerWorkerId,
        kind: '' as TowerWorkerKind,
        source_room_id: null,
        position: [0 as int, 0],
        destination: [0 as int, 0 as int],
        destination_room_id: null,
        next_step: null,
        stats: null,
    };
}
