import { useState } from 'react';

interface Props {
    position: 'left' | 'right' | null;
    set_position: (p: 'left' | 'right') => void;
    pinned: boolean;
    set_pinned: (pinned: boolean) => void;
}

const style: React.CSSProperties = {
    flexGrow: 1,
    transition: 'background-color 0.1s linear',
};

export function PinSide({ position, set_position, pinned, set_pinned }: Props) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
        >
            <button
                className={'flat-button hover-color'}
                type={'button'}
                title={'Move Left'}
                style={{
                    ...style,
                    textAlign: 'start',
                }}
                hidden={position === null || position === 'left'}
                onClick={() => {
                    set_position('left');
                }}
            >
                {'<<'}
            </button>
            <button
                type={'button'}
                className={'flat-button hover-color'}
                title={pinned ? 'Hide' : 'Pin'}
                style={{
                    ...style,
                    flexGrow: 2,
                }}
                onClick={() => {
                    set_pinned(!pinned);
                }}
            >
                <Tack
                    style={{
                        width: '9px',
                        transform: pinned ? '' : 'rotate3d(0, 0, 1, -45deg)',
                    }}
                />
            </button>
            <button
                className={'flat-button hover-color'}
                type={'button'}
                title={'Move Right'}
                style={{
                    ...style,
                    textAlign: 'end',
                }}
                hidden={position === null || position === 'right'}
                onClick={() => {
                    set_position('right');
                }}
            >
                {'>>'}
            </button>
        </div>
    );
}

function Tack({ style }: { style?: React.CSSProperties }) {
    return (
        // biome-ignore lint/a11y/noSvgWithoutTitle: tack
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style={style}>
            <path d="M32 32C32 14.3 46.3 0 64 0L320 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-29.5 0 10.3 134.1c37.1 21.2 65.8 56.4 78.2 99.7l3.8 13.4c2.8 9.7 .8 20-5.2 28.1S362 352 352 352L32 352c-10 0-19.5-4.7-25.5-12.7s-8-18.4-5.2-28.1L5 297.8c12.4-43.3 41-78.5 78.2-99.7L93.5 64 64 64C46.3 64 32 49.7 32 32zM160 400l64 0 0 112c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-112z" />
        </svg>
    );
}

export function usePinSide(pinned_i = true, position_i: 'left' | 'right' | null = 'left') {
    const [pinned, set_pinned] = useState(pinned_i);
    const [position, set_position] = useState(position_i);
    return {
        elem: <PinSide pinned={pinned} set_pinned={set_pinned} set_position={set_position} position={position} />,
        pinned,
        set_pinned,
        set_position,
        position,
    };
}
