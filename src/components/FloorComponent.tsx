import { memo, useContext } from 'react';
import { ROOM_HEIGHT } from '../constants.ts';
import { BuildingContext } from '../context/BuildingContext.ts';
import { FloorContext } from '../context/FloorContext.ts';
import { useConstructionContext } from '../hooks/useConstructionContext.ts';
import { useFloorActions } from '../hooks/useFloorActions.ts';
import { hori, verti } from '../logic/positioning.ts';
import type { Floor } from '../types/Floor.ts';
import { FLOOR_DEFS } from '../types/FloorDefinition.ts';
import { FloorExtendOverlay, NewFloorOverlay } from './FloorExtendOverlay.tsx';
import { FloorRezoneOverlay } from './FloorRezoneOverlay.tsx';
import { RoomComponentMemo } from './RoomComponent.tsx';

interface Props {
    floor: Floor;
}

export function FloorComponent({ floor }: Props) {
    const [building] = useContext(BuildingContext);
    const update_floor = useFloorActions(floor);

    const [construction] = useConstructionContext('rezone', 'extend_floor');
    const floor_def = floor.kind ? FLOOR_DEFS.buildables[floor.kind] : FLOOR_DEFS.empty;

    const style = {
        height: `${ROOM_HEIGHT}px`,
        top: verti(-floor.height - 1),
        position: 'absolute',
        zIndex: 0,
    } as const;

    const floor_below = building.floors[building.top_floor - floor.height + 1];

    return (
        <FloorContext value={[floor, update_floor]}>
            <div style={style} id={`floor-${floor.height}`}>
                <Background floor={floor} />
                {floor_below && floor_below.height >= 0 && <RoofOnBelow floor={floor} below_floor={floor_below} />}
                {building.top_floor === floor.height && (
                    // give us our own roof if we are on the top of the building
                    <div style={{ position: 'absolute', top: verti(-1) }}>
                        <RoofOnBelow floor={floor} below_floor={floor} />
                    </div>
                )}
                {construction?.type === 'rezone' && floor_def.id !== construction.value && (
                    <FloorRezoneOverlay floor_kind={construction.value} />
                )}
                {construction?.type === 'extend_floor' && <FloorExtendOverlay />}
                {floor.room_ids.map((room_id) => (
                    <RoomComponentMemo key={room_id} room={building.rooms[room_id]} />
                ))}
                {(floor_def.bookend_left || floor_def.bookend_right) && (
                    <img
                        src={floor_def.bookend_left || floor_def.bookend_right}
                        alt={'left'}
                        style={{
                            ...bookend_styles(floor),
                            left: hori(-floor.size_left),
                            transform: !floor_def.bookend_left ? 'scaleX(-1)' : '',
                        }}
                    />
                )}
                {(floor_def.bookend_right || floor_def.bookend_left) && (
                    <img
                        src={floor_def.bookend_right || floor_def.bookend_left}
                        alt={'right'}
                        style={{
                            ...bookend_styles(floor),
                            right: hori(-floor.size_right),
                            transform: !floor_def.bookend_right ? 'scaleX(-1)' : '',
                        }}
                    />
                )}
            </div>
        </FloorContext>
    );
}

export const FloorComponentMemo = memo(FloorComponent);

function Background({ floor }: { floor: Floor }) {
    const floor_def = floor.kind ? FLOOR_DEFS.buildables[floor.kind] : FLOOR_DEFS.empty;
    return <div style={bg_styles(floor, floor_def.background)} />;
}

/**
 * Roof for the floor below. Not for ourselves (except the top floor), just so we don't have to deal with layering display issues
 */
function RoofOnBelow({ floor, below_floor }: { floor: Floor; below_floor: Floor }) {
    if (floor.height < 0) return null;
    return (
        <div
            id={`floor-${below_floor.height}-roof`}
            style={{
                ...bg_styles(below_floor, FLOOR_DEFS.empty_roof.background),
                zIndex: -2,
            }}
        ></div>
    );
}

export function TopRoofComponent() {
    // doesn't actually show the roof because the animations weren't lining up properly with the top floor being expanded.
    const [building] = useContext(BuildingContext);
    const floor = building.floors[0];
    const [construction] = useConstructionContext('extend_floor');
    return (
        <div
            id={`roof-${building.id}`}
            style={{
                position: 'absolute',
                top: verti(-floor.height - 2),
            }}
        >
            {construction && building.top_floor < building.max_height && <NewFloorOverlay />}
        </div>
    );
}

function bg_styles(floor: Floor, image: string): React.CSSProperties {
    return {
        backgroundRepeat: 'repeat-x',
        backgroundImage: `url(${image})`,
        width: hori(floor.size_left + floor.size_right),
        height: `${ROOM_HEIGHT}px`,
        left: hori(-floor.size_left),
        borderBottom: `2px solid black`,
        zIndex: -1,
        position: 'absolute',
        transition: 'width 0.4s ease-in-out, left 0.4s ease-in-out',
    };
}

function bookend_styles(floor: Floor): React.CSSProperties {
    return {
        position: 'absolute',
        zIndex: floor.height,
    };
}
