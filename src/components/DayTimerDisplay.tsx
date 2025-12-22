import { useContext } from 'react';
import { BuildingContext } from '../context/BuildingContext.ts';
import { usePausedStore } from '../context/PausedContext.ts';

const NOON = 12 * 60 * 1000;
export function DayTimerDisplay() {
    const [building, update] = useContext(BuildingContext);
    const { pause, paused, unpause } = usePausedStore();
    const day_number = Math.floor(building.time_ms / building.time_per_day_ms) + 1;
    const sday_start = NOON - Math.floor((building.time_per_day_ms * 2) / 3);
    const day_start = Math.round(sday_start / 60_000) * 60_000;
    const time = building.time_ms % building.time_per_day_ms;
    return (
        <div
            style={{
                position: 'fixed',
                display: 'flex',
                justifyContent: 'center',
                width: 'calc(100vw)',
                padding: '4px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3px',
                }}
            >
                {building.day_started && (
                    <>
                        <span>Day {day_number}</span>
                        <Time time={time + day_start} />
                        <span style={{ display: 'flex', gap: '4px' }}>
                            <Time time={day_start} style={{ fontSize: 'small' }} />
                            <progress max={building.time_per_day_ms} value={time} />
                            <Time time={day_start + building.time_per_day_ms} style={{ fontSize: 'small' }} />
                        </span>
                        <button type={'button'} onClick={paused ? unpause : pause}>
                            {paused ? 'Un' : ''}Pause
                        </button>
                    </>
                )}
                {!building.day_started && (
                    <button
                        type={'button'}
                        onClick={() =>
                            update({
                                action: 'start-day',
                            })
                        }
                    >
                        Start Day {day_number}
                    </button>
                )}
            </div>
        </div>
    );
}

function Time({ time, style }: { time: number; style?: React.CSSProperties }) {
    const mod12 = (time / 60 / 1000) % 12;
    const minute = (time / 1000) % 60;
    return (
        <span style={style}>
            {Math.floor(mod12) || 12}:{String(Math.floor(minute)).padStart(2, '0')} {time > NOON ? 'pm' : 'am'}
        </span>
    );
}
