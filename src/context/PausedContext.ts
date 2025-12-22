import { create } from 'zustand/react';

interface State {
    paused: boolean;
    pause(): void;
    unpause(): void;
}

export const usePausedStore = create<State>((set) => ({
    paused: false,
    pause() {
        set({ paused: true });
    },
    unpause() {
        set({ paused: false });
    },
}));
