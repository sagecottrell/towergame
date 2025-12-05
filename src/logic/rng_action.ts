import type { Building } from '../types/Building.ts';

const FACTOR = 4987; // random prime number
const MOD = Number.MAX_SAFE_INTEGER;

/**
 * NOT a super robust or good rng algorithm. but we don't really need a good rng algorithm.
 * it's fine if the player discovers the patterns. it's encouraged, actually.
 * @param building
 * @param steps
 */
function advance_rng(building: Building, steps: number) {
    if (steps <= 0) throw new RangeError(`advance_rng steps cannot be below 1. Got: "${steps}"`);
    let next = building.rng_state;
    while (steps-- > 0) {
        next = (building.rng_state * FACTOR) % MOD;
    }
    building.rng_state = next;
    return next;
}

type RNG_ACTIONS = 'buy-room' | 'add-floor' | 'night-bonus' | 'event-time-next' | 'event-kind-next';

/**
 * stores all the actions that require/advance the seeded RNG
 * @param building
 * @param action
 */
export function rng_action(building: Building, action: RNG_ACTIONS): number {
    let steps = 0;
    let mod = 0; // the number of options. calculate from the building state
    switch (action) {
        case 'buy-room':
            steps = 2;
            break;
        case 'add-floor':
            steps = 5;
            break;
        case 'night-bonus':
            steps = 2;
            mod = 3;
            break;
        case 'event-time-next':
            steps = 3;
            mod = 3;
            break;
        case 'event-kind-next':
            steps = 5;
            mod = 3;
            break;
    }
    if (steps && mod) return advance_rng(building, steps) % mod;
    if (steps) advance_rng(building, steps);
    return 0;
}
