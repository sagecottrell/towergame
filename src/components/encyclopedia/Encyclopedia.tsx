import { useContext, useState } from 'react';
import { entries } from '../../betterObjectFunctions.ts';
import { SaveFileContext } from '../../context/SaveFileContext.ts';
import { FLOOR_DEFS, type FloorKind } from '../../types/FloorDefinition.ts';
import { ROOM_DEFS, type RoomKind } from '../../types/RoomDefinition.ts';
import type { TransportationKind } from '../../types/TransportationDefinition.ts';
import { Modal, type ModalProps } from '../Modal.tsx';
import { EncyclopediaFloor } from './EncyclopediaFloor.tsx';
import { EncyclopediaRoom } from './EncyclopediaRoom.tsx';

interface Props {
    initial?:
        | 'top'
        | 'rooms'
        | { room: RoomKind }
        | 'transports'
        | { transport: TransportationKind }
        | 'floors'
        | { floor: FloorKind }
        | 'how-to-build-destroy-room'
        | 'how-to-rezone'
        | 'how-to-upgrade-room'
        | 'account-wallet'
        | 'tower-wallet';
}

export function Encyclopedia({ initial = 'top' }: Props) {
    const [location, set_location] = useState(initial);
    const items = get_side_items(set_location);
    const room_items = get_room_items(set_location);
    const floor_items = get_floor_items(set_location);
    if (location === 'top')
        return (
            <Layout side_items={items} active={location}>
                Hi
            </Layout>
        );
    if (location === 'how-to-build-destroy-room')
        return (
            <Layout side_items={items} active={location}>
                How to build rooms
            </Layout>
        );
    if (location === 'how-to-rezone')
        return (
            <Layout side_items={items} active={location}>
                How to rezone floors
            </Layout>
        );
    if (location === 'how-to-upgrade-room')
        return (
            <Layout side_items={items} active={location}>
                How to upgrade rooms
            </Layout>
        );
    if (location === 'account-wallet')
        return (
            <Layout side_items={items} active={location}>
                Account wallet?
            </Layout>
        );
    if (location === 'tower-wallet')
        return (
            <Layout side_items={items} active={location}>
                Tower wallet?
            </Layout>
        );
    if (location === 'rooms')
        return (
            <Layout side_items={items} active={location}>
                <Layout active={''} side_items={room_items}>
                    Rooms
                </Layout>
            </Layout>
        );
    if (location === 'transports')
        return (
            <Layout side_items={items} active={location}>
                Transports
            </Layout>
        );
    if (location === 'floors')
        return (
            <Layout side_items={items} active={location}>
                <Layout active={''} side_items={floor_items}>
                    Floors
                </Layout>
            </Layout>
        );
    if ('room' in location) {
        return (
            <Layout side_items={items} active={'rooms'}>
                <Layout active={location.room} side_items={room_items}>
                    <EncyclopediaRoom room_kind={location.room} />
                </Layout>
            </Layout>
        );
    }
    if ('floor' in location) {
        return (
            <Layout side_items={items} active={'floors'}>
                <Layout active={location.floor} side_items={floor_items}>
                    <EncyclopediaFloor floor_kind={location.floor} />
                </Layout>
            </Layout>
        );
    }
    return (
        <Layout side_items={items} active={''}>
            Unknown Page
        </Layout>
    );
}

/**
 * A modal wrapper around the encyclopedia
 * @param initial
 * @param modal_props
 * @constructor
 */
export function EncyclopediaModal({ initial, ...modal_props }: Props & ModalProps) {
    modal_props['style'] = {
        minWidth: 'calc(100vw*2/3)',
        height: 'calc(100vh*2/3)',
        border: '2px grey solid',
    };
    return (
        <Modal {...modal_props}>
            <Encyclopedia initial={initial} />
        </Modal>
    );
}

interface LayoutProps {
    side_items: [name: string, button_content: React.ReactNode, on_click: () => void][];
    active: string;
}

/**
 * Helper layout component for buttons on the left, content on the right
 * @param active
 * @param side_items
 * @param children
 * @constructor
 */
function Layout({ active, side_items, children }: LayoutProps & React.PropsWithChildren) {
    return (
        <div style={{ display: 'flex', gap: '5px', height: '100%', width: '100%' }}>
            <div
                style={{
                    boxSizing: 'border-box',
                    minWidth: '150px',
                    height: '100%',
                    overflowY: 'scroll',
                    border: '1px black solid',
                    padding: '5px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {side_items.map(([name, button, on_click]) => (
                    <button
                        type={'button'}
                        key={name}
                        onClick={on_click}
                        style={{
                            overflow: 'clip',
                            borderRadius: 0,
                            padding: '5px',
                            backgroundColor: active === name ? 'darkgray' : 'lightgray',
                        }}
                        disabled={active === name}
                    >
                        {button}
                    </button>
                ))}
            </div>
            {children}
        </div>
    );
}

/**
 * generates the top-level list of buttons
 * @param update_func
 */
function get_side_items(update_func: (p: NonNullable<Props['initial']>) => void): LayoutProps['side_items'] {
    return [
        ['top', 'Top', () => update_func('top')],
        ['tower-wallet', 'Tower Wallet', () => update_func('tower-wallet')],
        ['rooms', 'Rooms', () => update_func('rooms')],
        ['floors', 'Floors', () => update_func('floors')],
    ] satisfies [name: Props['initial'], button_content: React.ReactNode, on_click: () => void][];
}

/**
 * generates the list of rooms to look at
 * @param update_func
 */
function get_room_items(update_func: (p: NonNullable<Props['initial']>) => void): LayoutProps['side_items'] {
    const [save] = useContext(SaveFileContext);

    return entries(ROOM_DEFS)
        .filter(([kind]) => save.rooms_seen.includes(kind))
        .map(
            ([kind, def]) =>
                [
                    kind,
                    <Item key={0} name={def.display_name} sprite={def.build_thumb ?? def.sprite_empty} />,
                    () => update_func({ room: kind }),
                ] as const,
        );
}

/**
 * generates the list of floors to look at
 * @param update_func
 */
function get_floor_items(update_func: (p: NonNullable<Props['initial']>) => void): LayoutProps['side_items'] {
    const [save] = useContext(SaveFileContext);
    return entries(FLOOR_DEFS.buildables)
        .filter(([kind]) => save.floors_seen.includes(kind))
        .map(
            ([kind, def]) =>
                [
                    kind,
                    <Item key={0} name={def.name} sprite={def.background} />,
                    () => update_func({ floor: kind }),
                ] as const,
        );
}

function Item({ name, sprite }: { name: string; sprite: string | undefined }) {
    return (
        <span
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '5px',
            }}
        >
            <span>{name}</span> <img alt={name} src={sprite} />
        </span>
    );
}
