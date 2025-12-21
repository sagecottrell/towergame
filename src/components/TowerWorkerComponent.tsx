import { memo } from 'react';
import { useMountTransition } from '../hooks/useMountTransition.ts';
import { hori, verti } from '../logic/positioning.ts';
import type { TowerWorker } from '../types/TowerWorker.ts';
import { TOWER_WORKER_DEFS } from '../types/TowerWorkerDefinition.ts';

const SPAWN_TIME = 500;

interface Props {
    worker: TowerWorker;
}

function TowerWorkerComponent({ worker }: Props) {
    const [floor, pos] = worker.position;
    const [, npos] = worker.next_step ?? worker.destination;
    const def = TOWER_WORKER_DEFS[worker.kind];

    const init_style: React.CSSProperties = {
        left: hori(pos),
        opacity: 0,
    };
    const mounted_style: React.CSSProperties = {
        left: hori(pos),
        opacity: 1,
    };
    const moving_style: React.CSSProperties = {
        left: hori(npos),
    };

    const [sprite, t_style] = useMountTransition(
        SPAWN_TIME,
        [def.sprite_stationary, init_style] as const,
        [def.sprite_stationary, mounted_style],
        [def.sprite_moving, moving_style],
    );

    const speed = worker.stats?.speed ?? def.movement_speed;
    const style: React.CSSProperties = {
        ...t_style,
        position: 'absolute',
        top: verti(-floor - 1),
        transition: `left ${Math.abs(npos - pos) / speed}s linear, opacity ${SPAWN_TIME / 1000}s linear`,
        animationPlayState: 'inherit',
    };
    return <img style={style} src={sprite} alt={worker.kind} />;
}

export const TowerWorkerComponentMemo = memo(TowerWorkerComponent);
