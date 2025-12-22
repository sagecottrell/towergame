import {memo} from 'react';
import {WORKER_SPAWN_DELAY_MS} from '../constants.ts';
import {hori, verti} from '../logic/positioning.ts';
import type {TowerWorker} from '../types/TowerWorker.ts';
import {TOWER_WORKER_DEFS} from '../types/TowerWorkerDefinition.ts';
import {animate} from "../logic/animate.ts";

interface Props {
    worker: TowerWorker;
}

function TowerWorkerComponent({worker}: Props) {
    const [floor, pos] = worker.position;
    const [, npos] = worker.next_step ?? worker.destination;
    const def = TOWER_WORKER_DEFS[worker.kind];

    const init_style = {
        left: hori(pos),
        opacity: 0,
        backgroundImage: `url(${def.sprite_stationary})`,
    } satisfies React.CSSProperties;
    const mounted_style = {
        left: hori(pos),
        opacity: 1,
    } satisfies React.CSSProperties;
    const moving_style = {
        left: hori(npos),
        backgroundImage: `url(${def.sprite_moving})`,
    } satisfies React.CSSProperties;

    const speed = worker.stats?.speed ?? def.movement_speed;
    const style: React.CSSProperties = {
        position: 'absolute',
        top: verti(-floor - 1),
        width: hori(2),
        height: verti(1),
        backgroundRepeat: 'no-repeat',
    };
    const travel_time_ms = (Math.abs(npos - pos) * 1000) / speed;
    return (
        <div
            ref={(ref) => {
                animate(
                    ref,
                    [
                        {...init_style, length_ms: WORKER_SPAWN_DELAY_MS},
                        {...mounted_style, length_ms: travel_time_ms},
                        {...moving_style, length_ms: WORKER_SPAWN_DELAY_MS},
                    ],
                );
            }}
            style={style}
        />
    );
}

export const TowerWorkerComponentMemo = memo(TowerWorkerComponent);
