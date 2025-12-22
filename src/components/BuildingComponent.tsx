import { useCallback, useContext } from 'react';
import { entries } from '../betterObjectFunctions.ts';
import { BuildingContext } from '../context/BuildingContext.ts';
import { DebugModeContext } from '../context/DebugModeContext.ts';
import { usePausedStore } from '../context/PausedContext.ts';
import { useBuildingActions } from '../hooks/useBuildingActions.ts';
import { useBuildingTick } from '../hooks/useBuildingTick.ts';
import { useScroll } from '../hooks/useScroll.ts';
import { hori, verti } from '../logic/positioning.ts';
import type { Building } from '../types/Building.ts';
import { BuildMenu } from './BuildMenu.tsx';
import { RoomBuilderTotalMemo } from './BuildRoomOverlay.tsx';
import { DayTimerDisplay } from './DayTimerDisplay.tsx';
import { FloorComponentMemo, TopRoofComponent } from './FloorComponent.tsx';
import { ResourceMapDisplay } from './ResourceMapDisplay.tsx';
import { RoomInfo } from './RoomInfo.tsx';
import { TowerWorkerComponentMemo } from './TowerWorkerComponent.tsx';
import { TransportationComponentMemo } from './TransportationComponent.tsx';

interface Props {
    building: Building;
    show_build_menu?: boolean;
}

export function BuildingComponent({ building, show_build_menu = true }: Props) {
    const update = useBuildingActions(building);
    const ref = useScroll();
    const { paused } = usePausedStore();
    const can_tick = useCallback(() => building.day_started && !paused, [building, paused]);
    useBuildingTick(can_tick, update);

    const top = verti(Math.max(0, building.floors.length - 10));
    const left = `calc(100vw/2 + ${hori(building.position)})`;
    const debug_mode = useContext(DebugModeContext);

    return (
        <BuildingContext value={[building, update]}>
            <Ground building={building} />
            {debug_mode && (
                <div style={{ position: 'fixed', right: 0, width: '100px', top: 0 }}>
                    {entries(building.workers).map(([id, worker]) => (
                        <p key={id}>
                            {id}
                            {worker.kind}
                            {worker.next_step}
                            {worker.stats?.payload && (
                                <ResourceMapDisplay
                                    resources={{ [worker.stats.payload[0]]: worker.stats.payload[1] }}
                                />
                            )}
                        </p>
                    ))}
                </div>
            )}
            <DayTimerDisplay />
            <div
                ref={ref}
                id={`building-${building.id}`}
                style={{
                    left,
                    position: 'absolute',
                    height: verti(2),
                    top: `calc(100vh + ${top})`,
                    animationPlayState: paused ? 'paused' : 'running',
                }}
            >
                {Object.values(building.floors).map((floor) => (
                    <FloorComponentMemo key={floor.height} floor={floor} />
                ))}
                <TopRoofComponent />
                <RoomBuilderTotalMemo />
                {Object.entries(building.transports).map(([_id, t]) => (
                    <TransportationComponentMemo key={`${t.height}-${t.position}`} transport={t} />
                ))}
                {Object.values(building.workers).map((worker) => (
                    <TowerWorkerComponentMemo worker={worker} key={worker.id} />
                ))}
            </div>
            <div id={'static-items'} style={{ position: 'fixed' }}>
                {show_build_menu && (
                    <div style={{ display: 'inline-block' }}>
                        <BuildMenu />
                    </div>
                )}
                <div style={{ display: 'inline-block' }}>
                    <RoomInfo />
                </div>
            </div>
        </BuildingContext>
    );
}

function Ground({ building }: { building: Building }) {
    const ground_depth = verti(Math.max(4, building.floors.length - building.top_floor + 4));
    const g_width = hori((building.position ?? 0) + building.max_width + 5);
    const top = verti(Math.max(0, building.floors.length - 10));
    return (
        <div
            id={`ground-${building.id}`}
            style={{
                top: `calc(100vh + ${top})`,
                height: ground_depth,
                position: 'absolute',
                width: `calc(100vw + ${g_width})`,
                background: 'saddlebrown',
            }}
        >
            <div
                style={{
                    // a fun little gradient over the ground to make the depths appear different
                    height: ground_depth,
                    backgroundSize: `${g_width} ${verti(100)}`,
                    backgroundImage:
                        'linear-gradient(to bottom, color-mix(in srgb, red, transparent 90%), color-mix(in srgb, yellow, transparent 90%))',
                }}
            />
        </div>
    );
}
