import type { Building } from './Building.ts';
import type { FloorKind } from './FloorDefinition.ts';
import type { ResourceMap } from './ResourceDefinition.ts';
import type { uint } from './RestrictedTypes.ts';
import type { RoomKind } from './RoomDefinition.ts';

/**
 * Represents the overall player's status across all play time.
 */
export interface SaveFile {
    buildings: Building[];
    current_building: number | null;

    wallet: ResourceMap<uint>;

    // keeps track of what rooms have been seen across all runs
    rooms_seen: RoomKind[];

    // keeps track of what floors have been seen across all runs
    floors_seen: FloorKind[];
}

export function Default(items?: Partial<SaveFile>): SaveFile {
    return {
        current_building: null,
        buildings: [],
        wallet: {},
        rooms_seen: [],
        floors_seen: [],
        ...items,
    };
}
