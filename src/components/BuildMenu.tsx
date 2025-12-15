import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { RoomCategory } from '../content/room-defs.ts';
import { BuildingContext } from '../context/BuildingContext.ts';
import { useConstructionContext } from '../hooks/useConstructionContext.ts';
import { mapping_sufficient } from '../logic/mappingComparison.ts';
import { FLOOR_DEFS, type FloorKind } from '../types/FloorDefinition.ts';
import type { ResourceMap } from '../types/ResourceDefinition.ts';
import type { uint } from '../types/RestrictedTypes.ts';
import { ROOM_DEFS, type RoomKind } from '../types/RoomDefinition.ts';
import { TRANSPORT_DEFS, type TransportationKind } from '../types/TransportationDefinition.ts';
import { EncyclopediaModal } from './encyclopedia/Encyclopedia.tsx';
import { usePinSide } from './PinSide.tsx';
import { ResourceMapDisplay } from './ResourceMapDisplay.tsx';

const build_menu_style = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'space-around',
    overflowY: 'scroll',
    height: '100vh',
    paddingBottom: '10px',
    gap: '10px',
    background: 'white',
    border: '1px solid black',
} as React.CSSProperties;

const build_kind_select_style = {
    padding: '10px',
    borderBottom: 0,
    borderTopLeftRadius: '5px',
    borderTopRightRadius: '5px',
} as React.CSSProperties;

const itemPadding = { paddingInline: '10px' } as React.CSSProperties;

enum Menu {
    Rooms,
    Floors,
    Transport,
    Power,
}

export function BuildMenu() {
    /// ====================================================================================================
    const [current_menu, set_current_menu] = useState<Menu>(Menu.Rooms);

    const {pinned, position, elem: pin_elem} = usePinSide(true, null);
    const [mouse_in, set_mouse_in] = useState(false);
    const [rect, set_rect] = useState<DOMRect | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    const [construction, set_construction] = useConstructionContext('room', 'rezone', 'extend_floor', 'transport');
    const [building] = useContext(BuildingContext);

    const set_menu = useCallback(
        (m: Menu) => {
            set_construction(null);
            set_current_menu(m);
        },
        [set_construction],
    );

    useEffect(() => {
        if (construction?.type !== 'room') return;
        const def = ROOM_DEFS[construction.value];
        if (!mapping_sufficient(building.wallet, def.cost_to_build(def.min_width, def.min_height))) {
            set_construction(null);
        }
    }, [construction, building.wallet, set_construction]);

    /// ====================================================================================================
    /// ====================================================================================================

    const select = { set_menu, current_menu };
    let current_display = null;
    switch (construction?.type) {
        case 'room':
            current_display = `Building: ${ROOM_DEFS[construction.value].display_name}`;
            break;
        case 'rezone':
            current_display = `Building Floor: ${FLOOR_DEFS.buildables[construction.value].name}`;
            break;
        case 'transport':
            current_display = `Building: ${TRANSPORT_DEFS[construction.value].name}`;
            break;
        case 'extend_floor':
            current_display = 'Extending floors';
            break;
    }

    /// ====================================================================================================
    /// ====================================================================================================

    return (
        <div
            ref={ref}
            style={{
                ...build_menu_style,
                ...side_styles(mouse_in, position, pinned, rect, 30),
            }}
            onMouseLeave={() => {
                set_mouse_in(false);
                set_rect(ref.current?.getBoundingClientRect() ?? null);
            }}
            onMouseEnter={() => {
                set_mouse_in(true);
            }}
            className={!mouse_in && !pinned ? 'hide-content' : ''}
        >
            {pin_elem}
            <div
                style={{
                    ...itemPadding,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                }}
            >
                Resources: <ResourceMapDisplay resources={building.wallet} show_zeroes show_name />
            </div>
            {construction && (
                <div style={{ ...itemPadding, display: 'flex', gap: '5px' }}>
                    {current_display}
                    <button type="reset" onClick={() => set_construction(null)}>
                        Cancel
                    </button>
                </div>
            )}

            <div style={itemPadding}>
                <SelectBuild which={Menu.Rooms} name={'Rooms'} {...select} />
                <SelectBuild which={Menu.Floors} name={'Floors'} {...select} />
                <SelectBuild which={Menu.Transport} name={'Transport'} {...select} />
            </div>

            <span style={itemPadding} hidden={current_menu !== Menu.Rooms}>
                <RoomSelector />
            </span>
            <span style={itemPadding} hidden={current_menu !== Menu.Floors}>
                <FloorSelector />
            </span>
            <span style={itemPadding} hidden={current_menu !== Menu.Transport}>
                <TransportationSelector />
            </span>
        </div>
    );
}

function RoomSelector() {
    const [construction, set_construction] = useConstructionContext('room');
    const [show, set_show] = useState<RoomKind | null>(null);

    return (
        <div className={'overflow-y-scroll'}>
            {Object.keys(ROOM_DEFS)
                .sort()
                .map((id) => ROOM_DEFS[id as RoomKind])
                .filter((def) => def.category === RoomCategory.Room)
                .map((def) => {
                    const min_cost = def.cost_to_build(def.min_width, def.min_height);
                    return (
                        <div
                            key={def.id}
                            className={'first-child-grow'}
                            style={{
                                marginTop: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                        >
                            <span className={'pointer'} onClick={() => set_show(def.id)}>
                                {def.display_name}
                            </span>
                            <img
                                className={'pointer'}
                                src={def.build_thumb ?? def.sprite_empty}
                                alt={def.sprite_empty}
                                onClick={() => set_show(def.id)}
                            />
                            <BuildButton
                                selected={construction?.value === def.id}
                                cost={min_cost}
                                set={() => {
                                    set_construction({
                                        type: 'room',
                                        value: def.id,
                                    });
                                }}
                            />
                        </div>
                    );
                })}
            {show && (
                <EncyclopediaModal show onClose={() => set_show(null)} closeOnOutsideClick initial={{ room: show }} />
            )}
        </div>
    );
}

function FloorSelector() {
    const [construction, set_construction] = useConstructionContext('rezone', 'extend_floor');
    const floor_kind = construction?.type === 'rezone' ? construction.value : null;
    return (
        <div className={'overflow-y-scroll'}>
            <button
                type={'button'}
                disabled={construction?.type === 'extend_floor'}
                onClick={() => {
                    set_construction({ type: 'extend_floor' });
                }}
            >
                Build More Floor
            </button>
            {Object.keys(FLOOR_DEFS.buildables)
                .sort()
                .map((id) => {
                    const def = FLOOR_DEFS.buildables[id as FloorKind];
                    return (
                        <div
                            key={id}
                            className={'first-child-grow'}
                            style={{
                                marginTop: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                        >
                            <span>{def.name}</span>
                            <img src={def.background} alt={def.background} />
                            <BuildButton
                                selected={floor_kind === def.id}
                                cost={def.cost_to_build}
                                set={() => {
                                    set_construction({
                                        type: 'rezone',
                                        value: def.id,
                                    });
                                }}
                            />
                        </div>
                    );
                })}
        </div>
    );
}

function TransportationSelector() {
    const [construction, set_construction] = useConstructionContext('transport');
    return (
        <div className={'overflow-y-scroll'}>
            {Object.keys(TRANSPORT_DEFS)
                .sort()
                .map((id) => TRANSPORT_DEFS[id as TransportationKind])
                .map((def) => {
                    return (
                        <div
                            key={def.id}
                            className={'first-child-grow'}
                            style={{
                                marginTop: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                        >
                            <span>{def.name}</span>
                            <img src={def.sprite_empty} alt={def.sprite_empty} />
                            <BuildButton
                                selected={construction?.value === def.id}
                                cost={def.cost_to_build(def.min_height)}
                                set={() => {
                                    set_construction({
                                        type: 'transport',
                                        value: def.id,
                                    });
                                }}
                            />
                        </div>
                    );
                })}
        </div>
    );
}

function side_styles(
    mouse_in: boolean,
    position: string | null,
    pinned: boolean,
    rect: DOMRect | null,
    visible: number,
): React.CSSProperties {
    return {
        right:
            position === 'right' ? (mouse_in ? '0px' : `-${pinned ? 0 : (rect?.width ?? 0) - visible}px`) : undefined,
        left: position !== 'left' ? (mouse_in ? '0px' : `-${pinned ? 0 : (rect?.width ?? 0) - visible}px`) : undefined,
        transition: `left 0.25s ease-out, right 0.25s ease-out`,
    };
}

function SelectBuild({
    which,
    name,
    set_menu,
    current_menu,
}: {
    which: Menu;
    name: string;
    set_menu: (f: Menu) => void;
    current_menu: Menu;
}) {
    return (
        <button
            style={build_kind_select_style}
            type={'button'}
            disabled={current_menu === which}
            onClick={() => {
                set_menu(which);
            }}
        >
            {name}
        </button>
    );
}

function BuildButton({ selected, cost, set }: { selected: boolean; cost: ResourceMap<uint>; set: () => void }) {
    const [building] = useContext(BuildingContext);
    return (
        <button
            type={'button'}
            style={{
                opacity: selected ? 0 : 100,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                borderRadius: 0,
                padding: '5px',
            }}
            disabled={selected || !mapping_sufficient(building.wallet, cost)}
            onClick={set}
        >
            Build
            <ResourceMapDisplay resources={cost} />
        </button>
    );
}
