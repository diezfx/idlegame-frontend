import log from "$lib/log/log";

const maxDelayMs = 500;

export function wrapDebounce(func: Function, delayMs: number): Function {
    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
    let firstCallTime: number | undefined = undefined;
    return function () {
        let usedDelayMs = delayMs;
        if (!firstCallTime) {
            firstCallTime = Date.now();
        } else {
            log.debug('debounce', {
                firstCallTime: firstCallTime,
                currentTime: Date.now(),
                delayMs: delayMs,
            });
            clearTimeout(timeoutId);
            if (Date.now() + delayMs - firstCallTime > maxDelayMs) {
                usedDelayMs = firstCallTime + maxDelayMs - Date.now();
            }
        }
        timeoutId = setTimeout(() => {
            firstCallTime = undefined;
            timeoutId = undefined;
            func();
        }, usedDelayMs);
    };
}


export function wrapRateLimit(func: Function, delayMs: number): Function {
    let firstCallTime: number | undefined = undefined;
    return function () {
        if (!firstCallTime) {
            firstCallTime = Date.now();
            func();
            return;
        }
        if (Date.now() - firstCallTime < delayMs) {
            return;
        }
        firstCallTime = Date.now();
        func();
    };
}