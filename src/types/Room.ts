import type { DiscriminatedUnion } from './DiscriminatedUnion.ts';
import type { ResourceMap } from './ResourceDefinition.ts';
import type { int, uint } from './RestrictedTypes.ts';
import type { RoomKind } from './RoomDefinition.ts';
import type { TowerWorkerKind } from './TowerWorkerDefinition.ts';

export type RoomId = int & { readonly _r_type: unique symbol };

export type RoomState = DiscriminatedUnion<
    'type',
    {
        Basic: { occupied: boolean };
        WaitingForResources: {
            // resources that have not been delivered, nor scheduled for delivery. If this is empty, then all inputs
            // are accounted for, but may not be delivered yet.
            needs: ResourceMap<uint>;
            // used to determine priority for delivery
            waiting_since: number;
        };
    }
>;

export interface Room {
    id: RoomId;
    position: int;
    kind: RoomKind;
    state: RoomState | null;
    bottom_floor: int;
    height: uint;
    width: uint;
    // running total of resources produced in this room
    total_resources_produced: ResourceMap<uint>;
    // workers employed in this room
    workers: { [p: TowerWorkerKind]: uint };
    workers_delivering: { [p: TowerWorkerKind]: uint };
    // resources stored in this room
    storage: ResourceMap<uint>;

    // precalculated list of rooms to send outputs or workers to
    output_priorities: { [p: RoomId]: 'prioritize' | 'never' };
    output_strategy: 'closest-first' | 'longest-wait-first' | 'farthest-first';
    // which rooms have which kinds of workers in what quantity
    produced_workers_committed: [RoomId, TowerWorkerKind, uint][];
    time_produced_today: uint;
    incoming_pending_deliveries: ResourceMap<uint>;
}

export function Default(items?: Partial<Room>): Room {
    return {
        id: 0 as RoomId,
        total_resources_produced: {},
        kind: '' as RoomKind,
        position: 0 as int,
        state: null,
        width: 0 as uint,
        height: 0 as uint,
        bottom_floor: 0 as int,
        workers: {},
        workers_delivering: {},
        storage: {},
        output_priorities: {},
        produced_workers_committed: [],
        time_produced_today: 0 as uint,
        output_strategy: 'longest-wait-first',
        incoming_pending_deliveries: {},
        ...items,
    };
}

export type RoomWithState<T extends RoomState['type']> = Room & { state: Extract<RoomState, { type: T }> };
