import isEmpty from 'lodash/isEmpty';
import { ROOM_DEFS, type RoomDefinition, type RoomKind } from '../../types/RoomDefinition.ts';
import { ResourceMapDisplay } from '../ResourceMapDisplay.tsx';
import { useLayoutEffect, useState } from 'react';
import { as_uint_or_default } from '../../types/RestrictedTypes.ts';

interface Props {
    room_kind: RoomKind;
}

export function EncyclopediaRoom({ room_kind }: Props) {
    const def = ROOM_DEFS[room_kind];
    const props = {
        // this object helps us make sure that we don't add a property to the room definition then forget to add it here.
        // some null props are OK, but it has to be explicit here.
        // some props may be combined into one display; this is also fine.
        display_name: <span style={{ fontSize: 'larger' }}>{def.display_name}</span>,
        readme: def.readme,
        cost_to_build: !isEmpty(def.cost_to_build(def.min_width, def.min_height)) && <CostCalculator def={def} />,
        production: !isEmpty(def.production) && (
            <div>
                {def.max_productions_per_day
                    ? `Produce up to ${def.max_productions_per_day} time${def.max_productions_per_day > 1 ? 's' : ''} per day`
                    : 'Produce'}
                :
                <ResourceMapDisplay resources={def.production} show_name />
            </div>
        ),
        max_productions_per_day: null,
        produce_to_wallet: null,
        workers_produced: null,
        workers_required: null,
        resource_requirements: null,
        upgrades: null,
        min_height: null,
        min_width: null,
        width_multiples_of: null,
        sprite_active: def.sprite_active && def.sprite_empty !== def.sprite_active && <>Active: <br/><img src={def.sprite_active} alt={'active'} /> </>,
        sprite_empty: def.sprite_empty && <>Default Sprite:<br/><img src={def.sprite_empty} alt={'empty'} /> </>,
        max_width: null,
        overlay: null,
        build_thumb: null,
        sprite_empty_night: def.sprite_empty_night && <>Night Empty:<br/><img src={def.sprite_empty_night} alt={'empty-night'} /> </>,
        sprite_active_night: def.sprite_active_night && <>Night Active:<br/><img src={def.sprite_active_night} alt={'active-night'} /> </>,
        max_height: null,
        category: null,
        d: null,
        id: null,
        tier: null,
    } satisfies { [p in keyof RoomDefinition]: React.ReactNode };
    return (
        <div style={{ display: 'flex', gap: '5px', flexDirection: 'column', width: '100%' }}>
            {Object.entries(props)
                .filter(([, value]) => value)
                .map(([key, value]) => (
                    <span key={key} className={'encyc-content-item'}>
                        {value}
                    </span>
                ))}
        </div>
    );
}

function CostCalculator({ def }: { def: RoomDefinition }) {
    const [w, setw] = useState(def.min_width);
    const [h, seth] = useState(def.min_height);
    useLayoutEffect(() => {
        setw(def.min_width);
        seth(def.min_height);
    }, [def]);
    return (
        <div>
            Cost:
            <br />
            {def.min_width !== def.max_width && (
                <label>
                    Width
                    <input
                        style={{ marginLeft: '5px', width: '45px' }}
                        type={'number'}
                        min={def.min_width / def.width_multiples_of}
                        max={def.max_width / def.width_multiples_of}
                        step={1}
                        value={w / def.width_multiples_of}
                        onChange={(e) => setw(as_uint_or_default(e.target.valueAsNumber * def.width_multiples_of))}
                    />
                </label>
            )}
            {def.min_height !== def.max_height && (
                <label>
                    Height
                    <input
                        style={{ marginLeft: '5px', width: '45px' }}
                        type={'number'}
                        min={def.min_height}
                        max={def.max_height}
                        step={1}
                        value={h}
                        onChange={(e) => seth(as_uint_or_default(e.target.valueAsNumber))}
                    />
                </label>
            )}
            <ResourceMapDisplay resources={def.cost_to_build(w, h)} show_name />
        </div>
    );
}
