// noinspection JSUnusedLocalSymbols

/** Logs additional information with start function. */
export function logStart(target: any, name: string, descriptor: any): void {
    console.log('[INFO] Creating board. Loading data.');
}

/** Measures time that takes to execute a decorated function. */
export const measurePerformance = (message: string) => (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args) {
        const start = performance.now();
        const result = originalMethod.apply(this, args);
        const finish = performance.now();

        console.log(`[INFO] Module { ${message} } took: ${finish - start} ms.`);
        return result;
    };
}