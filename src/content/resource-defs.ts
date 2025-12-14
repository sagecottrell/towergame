import type { SMap } from '../types/SMap.ts';
import images from './images.ts';

export const RESOURCE_DEFS_RAW = {
    coin: {
        sprite: images.resources.COIN_PNG,
    },
    bone: {
        sprite: images.resources.BONES_PNG,
    },
    fire: {
        sprite: images.resources.FIRE_PNG,
    },
    water: {
        sprite: images.resources.WATER_PNG,
    },
    death: {
        sprite: images.resources.DEATH_MAGIC_PNG,
    },
    metal: {
        sprite: images.resources.METAL_MAGIC_PNG,
    },
    air: {
        sprite: images.resources.AIR_PNG,
    },
    earth: {
        sprite: images.resources.EARTH_PNG,
    },
} satisfies SMap<ResourceDefRaw>;

export interface ResourceDefRaw {
    sprite: string;
}

export type ResourceIds = keyof typeof RESOURCE_DEFS_RAW;
export type ResourceMapRaw<T> = Partial<{ [p in ResourceIds]: T }>;
