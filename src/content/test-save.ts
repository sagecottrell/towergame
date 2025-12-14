import { Default as building } from '../types/Building.ts';
import { type FloorId, Default as floor } from '../types/Floor.ts';
import type { FloorKind } from '../types/FloorDefinition.ts';
import type { ResourceMap } from '../types/ResourceDefinition.ts';
import type { int, uint } from '../types/RestrictedTypes.ts';
import { type SaveFile, Default as save } from '../types/SaveFile.ts';

export const TEST_SAVE: SaveFile = save({
    buildings: [
        building({
            name: 'building',
            max_width: 30 as uint,
            position: 50 as int,
            top_floor: 0 as int,
            max_height: 10 as uint,
            wallet: { coin: 1000, bone: 10, fire: 1000 } as ResourceMap<uint>,
            new_things_acked: {},
            floors: [
                floor({
                    height: 0 as FloorId,
                    kind: 'basic' as FloorKind,
                    size_left: 8 as uint,
                    size_right: 8 as uint,
                }),
            ],
        }),
    ],
});
