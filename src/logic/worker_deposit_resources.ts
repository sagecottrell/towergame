import type { Room } from '../types/Room.ts';
import type { TowerWorker } from '../types/TowerWorker.ts';
import { mapping_add } from './mappingComparison.ts';

export function worker_deposit_resources(worker: TowerWorker, room: Room) {
    if (worker.stats?.payload) {
        const [payload_kind, payload_amount] = worker.stats.payload;
        room.storage = mapping_add({ [payload_kind]: payload_amount }, room.storage);
    }
}
