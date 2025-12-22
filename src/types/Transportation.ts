import type { int, uint } from './RestrictedTypes.ts';
import type { TowerWorker } from './TowerWorker.ts';
import type { TransportationKind } from './TransportationDefinition.ts';

export type TransportationId = uint & { readonly _t_type: unique symbol };

export interface Transportation {
    kind: TransportationKind;
    name?: string;
    id: TransportationId;
    position: int;
    bottom_floor: int;
    height: uint;
    occupancy: TowerWorker[];
    width: uint;
}

export function Default(items?: Partial<Transportation>): Transportation {
    return {
        kind: '' as TransportationKind,
        name: '',
        id: 0 as TransportationId,
        position: 0 as int,
        bottom_floor: 0 as int,
        height: 0 as uint,
        width: 0 as uint,
        occupancy: [],
        ...items,
    };
}
