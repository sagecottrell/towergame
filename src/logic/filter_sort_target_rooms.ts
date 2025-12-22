import { is } from '../is.ts';
import type { Room, RoomWithState } from '../types/Room.ts';

type S = RoomWithState<'WaitingForResources'>;

export function filter_sort_target_rooms(_thisroom: Room, rooms: Room[]) {
    return rooms.filter(is<S, Room>((x) => x.state?.type === 'WaitingForResources')).sort(longest_first);
}

function longest_first(a: S, b: S) {
    return b.state.waiting_since - a.state.waiting_since; /* a higher waiting time should come first */
}

// function closest_first(thisroom: Room, a: S, b: S) {
//     // path finding to the rooms
//     return 0;
// }
