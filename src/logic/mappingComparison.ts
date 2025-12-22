import merge from 'lodash/merge';

export function mapping_sufficient<O extends { [p: string]: number }>(value: O, target: O): boolean {
    for (const key in target) {
        const av = value[key];
        const bv = target[key];
        if (av === undefined) return false;
        if (av < bv) return false;
    }
    return true;
}

export function try_mapping_subtract<O extends { [p: string]: number }>(source: O, target: O, output: O): boolean {
    const source_copy = { ...source };
    for (const key in target) {
        const av = source_copy[key];
        const bv = target[key];
        if (av === undefined && bv !== undefined) return false;
        if (av !== undefined && bv !== undefined && av < bv) return false;
        source_copy[key] = (av! - bv!) as O[Extract<keyof O, string>];
    }
    merge(output, source_copy);
    return true;
}

export function mapping_subtract<O extends { [p: string]: number }>(a: O, b: O, keep_zeroes: boolean = true): O {
    const source_copy = { ...a };
    for (const key in b) {
        const av = source_copy[key] ?? 0;
        const bv = b[key] ?? 0;
        source_copy[key] = (av - bv) as O[Extract<keyof O, string>];
        if (source_copy[key] === 0 && !keep_zeroes) delete source_copy[key];
    }
    return source_copy;
}

export function mapping_add<O extends { [p: string]: number }, K extends O>(
    a: O,
    b: K,
    keep_zeroes: boolean = true,
): O {
    const sum: O = { ...a };
    for (const key in b) {
        const av = a[key];
        const bv = b[key];
        if (av !== undefined) sum[key] = (av + bv) as O[Extract<keyof O, string>];
        else sum[key] = bv;
        if (sum[key] === 0 && !keep_zeroes) delete sum[key];
    }
    return sum;
}

export function mapping_mul<O extends { [p: string]: number }>(a: O, n: number, keep_zeroes: boolean = true): O {
    const sum: O = { ...a };
    for (const resource in a) {
        const av = a[resource];
        if (av !== undefined) sum[resource] = (av * n) as O[Extract<keyof O, string>];
        if (sum[resource] === 0 && !keep_zeroes) delete sum[resource];
    }
    return sum;
}
