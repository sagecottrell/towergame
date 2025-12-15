import type { uint } from '../types/RestrictedTypes.ts';
import { TOWER_WORKER_DEFS, type TowerWorkerDefinition, type TowerWorkerKind } from '../types/TowerWorkerDefinition.ts';

interface Props {
    resources: { [p in TowerWorkerKind]: uint };
    show_counts?: boolean;
    show_zeroes?: boolean;
    show_all?: boolean;
    show_name?: boolean;
    style?: React.CSSProperties;
}

const img_size: React.CSSProperties = {
    width: '1em',
    height: '1em',
};
const flex: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
};

export function WorkerMapDisplay({
    resources,
    style,
    show_counts = true,
    show_zeroes = false,
    show_all = false,
    show_name = false,
}: Props) {
    return (
        <>
            {Object.values(TOWER_WORKER_DEFS).map((def) => {
                const r = resources[def.kind];
                if (!show_all && (r === undefined || r === null)) return null;
                if (!show_all && r === 0 && !show_zeroes) return null;
                return (
                    <span key={def.kind} style={{ ...flex, ...style }}>
                        <img style={img_size} src={def.sprite_stationary} alt={def.kind} />
                        <span>
                            {show_counts ? (r ?? 0) : null} {show_name ? calc_name(def, r ?? 0) : null}
                        </span>
                    </span>
                );
            })}
        </>
    );
}

function calc_name(def: TowerWorkerDefinition, amount: uint) {
    let name = def.display_name;
    if (!name) name = def.kind;
    const cap = name[0].toUpperCase() + def.kind.slice(1);
    if (amount <= 1) return cap;
    if (cap.endsWith('s')) return cap;
    return `${cap}s`;
}
