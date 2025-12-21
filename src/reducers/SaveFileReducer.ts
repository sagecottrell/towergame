import type { SaveFileActions } from '../events/SaveFileActions.ts';
import isEmpty from 'lodash/isEmpty';
import { cost_to_rezone_floor, worker_pool_total } from '../logicFunctions.ts';
import { Default as floor_default, type Floor, type FloorId } from '../types/Floor.ts';
import { FLOOR_DEFS } from '../types/FloorDefinition.ts';
import { as_int_or_default, type uint } from '../types/RestrictedTypes.ts';
import { ROOM_DEFS } from '../types/RoomDefinition.ts';
import type { SaveFile } from '../types/SaveFile.ts';
import { TRANSPORT_DEFS } from '../types/TransportationDefinition.ts';
import { Default as room_default, type Room, type RoomId, type RoomWithState } from '../types/Room.ts';
import { PriorityQueue } from '@datastructures-js/priority-queue';
import { Default as transport_default, type Transportation, type TransportationId } from '../types/Transportation.ts';
import { TOWER_WORKER_DEFS } from '../types/TowerWorkerDefinition.ts';
import { mapping_add, mapping_mul, mapping_sufficient, try_mapping_subtract } from '../logic/mappingComparison.ts';
import { worker_spawn } from '../logic/workerSpawn.ts';
import { apply_workers } from '../logic/applyWorkers.ts';
import { entries, keys } from '../betterObjectFunctions.ts';
import { is } from '../is.ts';
import { rng_action } from '../logic/rng_action.ts';

type ActionMap = {
    [p in SaveFileActions['action']]: (
        save_file: SaveFile,
        f: Readonly<
            Extract<
                SaveFileActions,
                {
                    action: p;
                }
            >
        >,
        dispatch: (action: SaveFileActions) => void,
    ) => void;
};

const ActionMaps: ActionMap = {
    'load-building'(save, { building_id }) {
        save.current_building = building_id;
    },
    // ================================================================================================================
    // ================================================================================================================
    'buy-perm-upgrade'() {},
    // ================================================================================================================
    // ================================================================================================================
    'increase-tier'(save, action) {
        const { building_id, tier } = action;
        const building = save.buildings[building_id];
        building.rating = tier;

        // add items to the save file "seen" props
        save.rooms_seen = [...new Set(keys(ROOM_DEFS).filter((kind) => ROOM_DEFS[kind].tier <= tier))];
        save.floors_seen = [
            ...new Set(keys(FLOOR_DEFS.buildables).filter((kind) => FLOOR_DEFS.buildables[kind].tier <= tier)),
        ];
    },
    // ================================================================================================================
    // ================================================================================================================
    'add-floor'(updated, action) {
        const { building_id, position } = action;
        const building = updated.buildings[building_id];
        const i = position === 'top' ? 0 : -1;
        const c = building.floors.at(i);
        if (!c) return;
        const floor: Floor = floor_default({
            size_left: FLOOR_DEFS.new_floor_size[0],
            size_right: FLOOR_DEFS.new_floor_size[1],
            height: as_int_or_default((i || 1) + c.height) as FloorId,
        });
        const cost = cost_to_rezone_floor(floor);
        if (!try_mapping_subtract(building.wallet, cost, building.wallet)) return;
        building.floors.splice(i, 0, floor);
        building.top_floor = building.floors[0].height;
        rng_action(building, 'add-floor');
    },
    // ================================================================================================================
    // ================================================================================================================
    'buy-room'(updated, action, dispatch) {
        const { building_id, floor_id, room } = action;
        const def = ROOM_DEFS[room.kind];
        const cost = def.cost_to_build(room.width, room.height);
        const building = updated.buildings[building_id];
        const floor = building.floors[building.top_floor - floor_id];
        if (!try_mapping_subtract(building.wallet, cost, building.wallet)) return;

        const new_room = room_default({
            ...room,
            id: building.room_id_counter as RoomId,
        });
        floor.room_ids.push(new_room.id);
        building.rooms[new_room.id] = new_room;
        building.room_id_counter += 1;
        if (!isEmpty(def.workers_produced)) {
            // assign workers to other rooms
            const rooms = Object.values(building.rooms)
                .filter((room) => ROOM_DEFS[room.kind].workers_required)
                .sort((a, b) => Math.abs(a.bottom_floor - floor_id) - Math.abs(b.bottom_floor - floor_id));
            for (const filled of apply_workers([new_room], rooms)) {
                dispatch({ action: 'room-tick', building_id, room_id: filled.id });
            }
        }
        if (!isEmpty(def.workers_required)) {
            // assign workers into this room
            const rooms = Object.values(building.rooms)
                .filter((room) => ROOM_DEFS[room.kind].workers_produced)
                .sort((a, b) => Math.abs(a.bottom_floor - floor_id) - Math.abs(b.bottom_floor - floor_id));
            for (const filled of apply_workers(rooms, [new_room])) {
                dispatch({ action: 'room-tick', building_id, room_id: filled.id });
            }
        }
        rng_action(building, 'buy-room');
    },
    // ================================================================================================================
    // ================================================================================================================
    'buy-transport'(updated, action) {
        const { building_id, bottom_floor, height, kind, position } = action;
        const building = updated.buildings[building_id];
        const id = (Math.max(...Object.values(building.transports).map((x) => x.id)) + 1) as TransportationId;
        const transport: Transportation = transport_default({
            id,
            bottom_floor,
            kind,
            height,
            position,
        });
        const cost = TRANSPORT_DEFS[transport.kind].cost_to_build(transport.height);
        if (try_mapping_subtract(building.wallet, cost, building.wallet)) {
            building.transports[id] = transport;
        }
    },
    // ================================================================================================================
    // ================================================================================================================
    'extend-floor'(updated, action) {
        const { size_left = 0, size_right = 0, building_id, floor_id } = action;
        const building = updated.buildings[building_id];
        const floor = building.floors[building.top_floor - floor_id];
        const added_floor = size_left + size_right;
        const cost = floor.kind
            ? mapping_add(FLOOR_DEFS.buildables[floor.kind].cost_to_build, FLOOR_DEFS.empty.cost_to_build)
            : FLOOR_DEFS.empty.cost_to_build;
        if (try_mapping_subtract(building.wallet, mapping_mul(cost, added_floor), building.wallet)) {
            floor.size_left = (floor.size_left + size_left) as uint;
            floor.size_right = (floor.size_right + size_right) as uint;
        }
    },
    // ================================================================================================================
    // ================================================================================================================
    'rezone-floor'(updated, action) {
        const { kind, building_id, floor_id } = action;
        const building = updated.buildings[building_id];
        const floor = building.floors[building.top_floor - floor_id];
        const cost = cost_to_rezone_floor(floor);
        if (try_mapping_subtract(building.wallet, cost, building.wallet)) floor.kind = kind;
    },
    // ================================================================================================================
    // ================================================================================================================
    'tick-building-time'(updated, action, dispatch) {
        const { building_id, delta } = action;
        const building = updated.buildings[building_id];
        building.time_ms = building.time_ms + delta;
        if (building.action_queue === null || building.action_queue.length === 0) return;
        const queue = PriorityQueue.fromArray(building.action_queue, (x) => x[0]);
        while (true) {
            const front = queue.front();
            if (!front || front[0] > building.time_ms) break;
            const next = queue.dequeue();
            if (next) dispatch(next[1]);
        }
        building.action_queue = queue.toArray();
    },
    // ================================================================================================================
    // ================================================================================================================
    'start-day'(updated, action, dispatch) {
        const { building_id } = action;
        const building = updated.buildings[building_id];
        building.day_started = true;
        dispatch({
            action: 'stop-day',
            building_id: building_id,
            delay_ms: building.time_per_day_ms,
        });
        // room-day-start all rooms
        for (const room_id of keys(building.rooms)) {
            dispatch({ action: 'room-day-start', building_id, room_id });
        }
    },
    // ================================================================================================================
    // ================================================================================================================
    'stop-day'(updated, action) {
        const { building_id } = action;
        const building = updated.buildings[building_id];
        building.day_started = false;
        building.time_ms -= building.time_ms % building.time_per_day_ms;
        // TODO: instantly resolve any pending worker-move-end actions and teleport them to their destination
    },
    // ================================================================================================================
    // ================================================================================================================
    'worker-spawn'(updated, action, dispatch) {
        // spawns a worker from their home room in order to take resources to another room.
        const { building_id, from_position, worker_kind } = action;
        const building = updated.buildings[building_id];
        const total = worker_pool_total(building);
        for (const worker of Object.values(building.workers)) {
            total[worker.kind] -= 1;
        }
        if (total[worker_kind] <= 0) {
            return dispatch({ ...action, delay_ms: 1000 });
        }
        const def = TOWER_WORKER_DEFS[worker_kind];
        const { worker_id, pnext } = worker_spawn(building, action);
        dispatch({
            action: 'worker-move-start',
            building_id,
            worker_id,
            delay_ms: (Math.abs(from_position - pnext) * 1000) / def.movement_speed,
        });
    },
    // ================================================================================================================
    // ================================================================================================================
    'worker-move-start'() {
        // add the worker into the building
    },
    'worker-move-end'() {
        // do these in order until one succeeds:
        // 1. check if reached destination; deposit resources; despawn worker and add back to room
        // 2. check if reached transportation; remove from building and add worker to transport
        // 3. despawn or attempt pathfinding to destination again
    },
    // ================================================================================================================
    // ================================================================================================================
    'room-day-start'(save, action, dispatch) {
        const { building_id, room_id } = action;
        const building = save.buildings[building_id];
        const room = building.rooms[room_id];
        room.time_produced_today = 0 as uint;
        dispatch({ action: 'room-tick', building_id, room_id });
    },
    // ================================================================================================================
    // ================================================================================================================
    'room-tick'(save, action, dispatch) {
        // check if enough workers are present and enough materials are in storage.
        // if yes, consume resources, produce outputs. Spawn workers for transport.
        const { building_id, room_id } = action;
        const building = save.buildings[building_id];
        const room = building.rooms[room_id];
        const def = ROOM_DEFS[room.kind];
        if (
            (def.max_productions_per_day ? room.time_produced_today < def.max_productions_per_day : true) &&
            mapping_sufficient(room.workers, def.workers_required) &&
            try_mapping_subtract(room.storage, def.resource_requirements, room.storage)
        ) {
            room.total_resources_produced = mapping_add(room.total_resources_produced, def.production);
            if (def.produce_to_wallet) {
                building.wallet = mapping_add(building.wallet, def.production);
                // it doesn't make sense to mobilize workers if we send straight to the wallet
                return;
            }
            room.storage = mapping_add(room.storage, def.production);
            const priority_targets = entries(room.output_priorities)
                .filter((p) => p[1] === 'prioritize')
                .map((p) => building.rooms[p[0]])
                .filter(is<RoomWithState<'WaitingForResources'>, Room>((x) => x.state?.type === 'WaitingForResources'))
                .sort(
                    (a, b) =>
                        b.state.waiting_since - a.state.waiting_since /* a higher waiting time should come first */,
                );

            for (const output_room of priority_targets) {
                for (const resource_id of keys(output_room.state.needs)) {
                    if (room.storage[resource_id]) {
                        const amount = Math.min(
                            output_room.state.needs[resource_id],
                            room.storage[resource_id],
                        ) as uint;
                        output_room.state.needs[resource_id] = (output_room.state.needs[resource_id] - amount) as uint;
                        room.storage[resource_id] = (room.storage[resource_id] - amount) as uint;
                        dispatch({
                            action: 'worker-spawn',
                            building_id,
                            dest_floor: output_room.bottom_floor,
                            dest_position: output_room.position,
                            from_floor: room.bottom_floor,
                            from_position: room.position,
                            payload: [resource_id, amount],
                            worker_kind: keys(def.workers_required)[0],
                        });
                    }
                }
            }
        }
    },
    // ================================================================================================================
    // ================================================================================================================
};

export function SaveFileReducer(save_file: SaveFile, { delay_ms, ...action }: SaveFileActions) {
    if (delay_ms && 'building_id' in action) {
        insert_future_action(save_file, action.building_id, action, delay_ms);
    } else {
        ActionMaps[action.action](
            save_file,
            //@ts-expect-error
            action,
            (a) => SaveFileReducer(save_file, a),
        );
    }
}

function insert_future_action(save_file: SaveFile, building_id: number, action: SaveFileActions, delay_ms: number) {
    const building = save_file.buildings[building_id];
    if (building.action_queue === null) return;
    const time = building.time_ms + delay_ms;
    const queue = PriorityQueue.fromArray(building.action_queue, ([x]) => x);
    queue.enqueue([time, action]);
    building.action_queue = queue.toArray();
}
