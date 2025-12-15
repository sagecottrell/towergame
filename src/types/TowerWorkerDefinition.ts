import { TOWER_WORKER_DEFS_RAW, type TowerWorkerDefsRaw } from '../content/tower-worker-defs.ts';
import { as_uint_or_default, type uint } from './RestrictedTypes.ts';

export type TowerWorkerKind = string & { readonly __type: unique symbol };

export interface TowerWorkerDefinition {
    kind: TowerWorkerKind;
    display_name?: string;
    sprite_moving: string;
    sprite_stationary: string;
    portrait: string;
    /*
    How many transports can it plan a path through.
    If the shortest available path length exceeds planning capacity, behavior is undefined.
     */
    planning_capability: uint;
    /*
    units of floor per second
     */
    movement_speed: number;
    base_capacity: uint;
}

export const TOWER_WORKER_DEFS: {
    [p: TowerWorkerKind]: TowerWorkerDefinition;
} = Object.fromEntries(Object.entries(TOWER_WORKER_DEFS_RAW).map(([id, def]) => [id, def_from_raw(id, def)]));

function def_from_raw(id: string, raw: TowerWorkerDefsRaw): TowerWorkerDefinition {
    return {
        kind: id as TowerWorkerKind,
        display_name: raw.display_name,
        sprite_moving: raw.sprite_moving,
        sprite_stationary: raw.sprite_stationary ?? raw.sprite_moving,
        portrait: raw.portrait ?? raw.sprite_stationary ?? raw.sprite_moving,
        planning_capability: as_uint_or_default(raw.planning_capability),
        movement_speed: raw.movement_speed,
        base_capacity: as_uint_or_default(raw.base_capacity),
    };
}
