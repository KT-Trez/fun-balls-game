// noinspection JSUnusedLocalSymbols

/** Logs additional information with start function. */
export function logStart(target: any, name: string, descriptor: any): void {
    console.log('[INFO] Creating board. Loading data.');
}

/** Measures time that took to execute pathfinding algorithm. */
export function measurePathfindingPerformance(target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args) {
        const start = performance.now();
        const result = originalMethod.apply(this, args);
        const finish = performance.now();

        console.log(`[INFO] Pathfinding took: ${finish - start} milliseconds.`);
        return result;
    };
}