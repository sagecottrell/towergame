import type { SaveFileActions } from '../events/SaveFileActions.ts';
import type { Building } from '../types/Building.ts';
import type { TowerWorkerId } from '../types/TowerWorker.ts';
import { TOWER_WORKER_DEFS } from '../types/TowerWorkerDefinition.ts';
import { pathfind_worker_next_step } from './workerPathfind.ts';

export function worker_spawn(
    building: Building,
    { payload, worker_kind, end_room_id, start_room_id }: Extract<SaveFileActions, { action: 'worker-spawn' }>,
) {
    const def = TOWER_WORKER_DEFS[worker_kind];
    const end_room = building.rooms[end_room_id];
    const start_room = building.rooms[start_room_id];
    const [fnext, pnext] = pathfind_worker_next_step(
        [start_room.bottom_floor, start_room.position],
        [end_room.bottom_floor, end_room.position],
        building,
        def.planning_capability,
    );
    const worker_id = (building.worker_id_counter + 1) as TowerWorkerId;
    building.worker_id_counter = worker_id;
    building.workers[worker_id] = {
        id: worker_id,
        kind: worker_kind,
        position: [start_room.bottom_floor, start_room.position],
        destination: [end_room.bottom_floor, end_room.position],
        next_step: [fnext, pnext],
        stats: {
            capacity: def.base_capacity,
            payload,
            speed: def.movement_speed,
            status: 'working',
        },
    };
    return { worker_id, pnext };
}
