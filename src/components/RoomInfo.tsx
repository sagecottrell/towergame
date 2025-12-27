import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import { useContext } from 'react';
import { entries, keys } from '../betterObjectFunctions.ts';
import { BuildingContext } from '../context/BuildingContext.ts';
import { useSelectedRoom } from '../hooks/useSelectedRoom.ts';
import type { RoomId } from '../types/Room.ts';
import { ROOM_DEFS } from '../types/RoomDefinition.ts';
import { ResourceMapDisplay } from './ResourceMapDisplay.tsx';
import { WorkerMapDisplay } from './WorkerMapDisplay.tsx';

export function RoomInfo() {
    const [selected] = useSelectedRoom.all();
    const [building] = useContext(BuildingContext);
    if (selected === null) return null;
    const room = building.rooms[selected];
    const def = ROOM_DEFS[room.kind];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span>
                Selected room: {def.display_name} - ID {room.id}
            </span>
            <span>Floor: {room.bottom_floor}</span>
            {(!isEmpty(def.resource_requirements) || !isEmpty(def.production)) && (
                <span>
                    Storage:
                    <ResourceMapDisplay
                        resources={room.storage}
                        show_name
                        force={[...keys(def.resource_requirements), ...keys(def.production)]}
                    />
                </span>
            )}
            {!isEmpty(room.workers) && (
                <span>
                    Workers:
                    <WorkerMapDisplay resources={room.workers} show_name show_zeroes />
                </span>
            )}
            {!isEmpty(room.workers_delivering) && (
                <span>
                    Workers Dispatched:
                    <WorkerMapDisplay resources={room.workers_delivering} show_name show_zeroes />
                </span>
            )}
            {!isEmpty(def.workers_produced) && (
                <span style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    Workers produced:
                    {entries(groupBy(room.produced_workers_committed, ([room_id]) => room_id)).map(
                        ([room_id, items]) => {
                            const map = Object.fromEntries(items.map(([, kind, count]) => [kind, count] as const));
                            const room = building.rooms[room_id as unknown as RoomId];
                            return (
                                <span key={room_id} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                    <img src={ROOM_DEFS[room.kind].build_thumb} alt={'no'} />
                                    Room {room_id}:
                                    <WorkerMapDisplay resources={map} show_name />
                                </span>
                            );
                        },
                    )}
                </span>
            )}
            {!isEmpty(room.incoming_pending_deliveries) && (
                <span style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    Incoming Deliveries:
                    <ResourceMapDisplay resources={room.incoming_pending_deliveries} show_name />
                </span>
            )}
            {!isEmpty(room.total_resources_produced) && (
                <span>
                    Resources Produced: <ResourceMapDisplay resources={room.total_resources_produced} />
                </span>
            )}
        </div>
    );
}
