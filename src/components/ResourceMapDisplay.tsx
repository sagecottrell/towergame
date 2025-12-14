import { RESOURCE_DEFS, type ResourceMap } from '../types/ResourceDefinition.ts';
import type { uint } from '../types/RestrictedTypes.ts';

interface Props {
    resources: ResourceMap<uint>;
    show_counts?: boolean;
    show_zeroes?: boolean;
    show_all?: boolean;
    style?: React.CSSProperties;
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
}: Props) {
    return (
        <>
            {Object.values(RESOURCE_DEFS).map((def) => {
                const r = resources[def.kind];
                if (!show_all && (r === undefined || r === null)) return null;
                if (!show_all && r === 0 && !show_zeroes) return null;
                return (
                    <span key={def.kind} style={{ ...flex, ...style }}>
                        <img title={def.kind} className={'resource-img'} src={def.sprite} alt={def.kind} />
                        <span>{show_counts ? (r ?? 0) : null}</span>
                    </span>
                );
            })}
        </>
    );
}
