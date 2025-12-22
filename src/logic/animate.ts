import { sum } from 'lodash';

type Keyframe = { easing?: string; length_ms: number } & Omit<React.CSSProperties, 'offset'>;


export function animate(e: HTMLElement | null, keyframes: Keyframe[], iterations: number = 1) {
    return e?.animate(...get_keyframes(keyframes, iterations));
}

function get_keyframes(keyframes: Keyframe[], iterations: number = 1) {
    const len = sum(keyframes.map((x) => x.length_ms));
    const {arr, current_len} = reduce(keyframes,
        (arr, current) => ({
            arr: [...arr.arr, {...current, offset: arr.current_len / len}],
            current_len: arr.current_len + current.length_ms,
        }),
        { arr: [] as Keyframe[], current_len: 0 },
    );
    return [arr, {duration: current_len, iterations}] as const;
}

function reduce<TInput, TOutput>(array: TInput[], reducer: (accumulator: TOutput, current: TInput) => TOutput, initial: TOutput) {
    if (array.length === 0)
        throw new RangeError("must have at least one element");
    let current = initial;
    for (const e of array) {
        current = reducer(current, e);
    }
    return current;
}