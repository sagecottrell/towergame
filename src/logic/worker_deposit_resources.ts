import type { Room } from '../types/Room.ts';
import type { TowerWorker } from '../types/TowerWorker.ts';
import { mapping_add } from './mappingComparison.ts';

export function worker_deposit_resources(worker: TowerWorker, room: Room) {
    if (worker.stats?.payload) {
        room.storage = mapping_add(worker.stats.payload, room.storage);
    }
}
