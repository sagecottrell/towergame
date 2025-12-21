import { useEffect, useState } from 'react';

export function useMountTransition<T>(delay: number, init: T, mounted: T, transitioned: T): T {
    const [has_mounted, set_has_mounted] = useState(false);
    const [has_transitioned, set_has_transitioned] = useState(false);
    useEffect(() => {
        if (has_mounted && !has_transitioned) {
            const timeout = setTimeout(() => {
                set_has_transitioned(true);
            }, delay);
            return () => clearTimeout(timeout);
        } else if (!has_mounted && !has_transitioned) {
            set_has_mounted(true);
        }
    }, [has_transitioned, has_mounted, delay]);
    return has_transitioned ? transitioned : has_mounted ? mounted : init;
}
