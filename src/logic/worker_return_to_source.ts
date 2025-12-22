import type { Building } from '../types/Building.ts';
import type { Room } from '../types/Room.ts';
import type { TowerWorker } from '../types/TowerWorker.ts';
import { mapping_subtract } from './mappingComparison.ts';

export function worker_return_to_source(building: Building, worker: TowerWorker) {
    delete building.workers[worker.id];
    if (worker.source_room_id) {
        const source_room = building.rooms[worker.source_room_id];
        source_room.workers_delivering = mapping_subtract(
            source_room.workers_delivering,
            { [worker.kind]: 1 } as Room['workers_delivering'],
            false,
        );
    }
}
