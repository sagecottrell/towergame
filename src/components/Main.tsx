import { useCallback, useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { useImmerReducer } from 'use-immer';
import { TEST_SAVE } from '../content/test-save.ts';
import { DebugModeContext } from '../context/DebugModeContext.ts';
import { usePausedStore } from '../context/PausedContext.ts';
import { SaveFileContext } from '../context/SaveFileContext.ts';
import type { SaveFileActions } from '../events/SaveFileActions.ts';
import { useConstructionContext } from '../hooks/useConstructionContext.ts';
import { useSelectedRoom } from '../hooks/useSelectedRoom.ts';
import { SaveFileReducer } from '../reducers/SaveFileReducer.ts';
import type { BuildingId } from '../types/Building.ts';
import type { uint } from '../types/RestrictedTypes.ts';
import type { SaveFile } from '../types/SaveFile.ts';
import { BuildingComponent } from './BuildingComponent.tsx';
import { BuildingSelect } from './BuildingSelect.tsx';

export function Main() {
    const debug_mode = useContext(DebugModeContext);
    const [state, dispatch] = useImmerReducer<SaveFile, SaveFileActions>(SaveFileReducer, TEST_SAVE);
    const { paused } = usePausedStore();
    const ref = useRef<HTMLElement>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: TODO: remove
    useEffect(() => {
        // runs the code that sets up various items in the building
        dispatch({ action: 'increase-tier', building_id: 0 as BuildingId, tier: 0 as uint });
    }, []);

    const [, set_construction] = useConstructionContext.all();
    const [, set_selected_room] = useSelectedRoom.all();
    const current_building = state.current_building !== null ? state.buildings[state.current_building] : null;

    useLayoutEffect(() => {
        if (paused) {
            ref.current?.getAnimations({ subtree: true }).forEach((x) => {
                x.pause();
            });
        } else {
            ref.current?.getAnimations({ subtree: true }).forEach((x) => {
                x.play();
            });
        }
    }, [paused]);

    const cancel_construction = useCallback(
        (ev: React.MouseEvent) => {
            if (!debug_mode) {
                ev.preventDefault();
                set_construction(null);
                set_selected_room(null);
            }
        },
        [set_construction, set_selected_room, debug_mode],
    );

    return (
        <SaveFileContext value={[state, dispatch]}>
            <main
                ref={ref}
                onContextMenu={cancel_construction}
                style={{
                    animationPlayState: paused ? 'paused' : 'running',
                }}
            >
                {!current_building && <BuildingSelect />}
                <StaticBg onContextMenu={cancel_construction} />
                {current_building && <BuildingComponent key={current_building.id} building={current_building} />}
            </main>
        </SaveFileContext>
    );
}

function StaticBg({ onContextMenu }: { onContextMenu?: React.MouseEventHandler<HTMLDivElement> }) {
    return <div className={'static-bg'} onContextMenu={onContextMenu}></div>;
}
