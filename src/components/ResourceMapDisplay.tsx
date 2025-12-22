import {
    RESOURCE_DEFS,
    type ResourceDefinition,
    type ResourceKind,
    type ResourceMap,
} from '../types/ResourceDefinition.ts';
import type { uint } from '../types/RestrictedTypes.ts';

interface Props {
    resources: ResourceMap<uint>;
    show_counts?: boolean;
    show_zeroes?: boolean;
    show_all?: boolean;
    show_name?: boolean;
    style?: React.CSSProperties;
    force?: ResourceKind[];
}

const flex: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
};

export function ResourceMapDisplay({
    resources,
    style,
    show_counts = true,
    show_zeroes = false,
    show_all = false,
    show_name = false,
    force,
}: Props) {
    return (
        <>
            {Object.values(RESOURCE_DEFS)
                .filter((def) => {
                    const r = resources[def.kind];
                    if (force?.includes(def.kind)) return true;
                    if (show_all) return true;
                    return r || (r === 0 && show_zeroes);
                })
                .map((def) => {
                    const r = resources[def.kind];
                    return (
                        <span key={def.kind} style={{ ...flex, ...style }}>
                            <img title={def.kind} className={'resource-img'} src={def.sprite} alt={def.kind} />
                            <span>
                                {show_counts ? (r ?? 0) : null} {show_name ? calc_name(def, r ?? 0) : null}
                            </span>
                        </span>
                    );
                })}
        </>
    );
}

function calc_name(def: ResourceDefinition, amount: uint) {
    let name = def.display_name;
    if (!name) name = def.kind;
    const cap = name[0].toUpperCase() + def.kind.slice(1);
    if (amount <= 1) return cap;
    if (cap.endsWith('s')) return cap;
    return `${cap}s`;
}
