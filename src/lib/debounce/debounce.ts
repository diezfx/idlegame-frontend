import log from '$lib/log/log';

const maxDelayMs = 500;

export function wrapDebounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	delayMs: number,
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
	let firstCallTime: number | undefined = undefined;
	return function (...args: Parameters<T>) {
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
			func(...args);
		}, usedDelayMs);
	};
}

export function wrapRateLimit<T extends (...args: unknown[]) => unknown>(
	func: T,
	delayMs: number,
): (...args: Parameters<T>) => void {
	let firstCallTime: number | undefined = undefined;
	return function (...args: Parameters<T>) {
		if (!firstCallTime) {
			firstCallTime = Date.now();
			func(...args);
			return;
		}
		if (Date.now() - firstCallTime < delayMs) {
			return;
		}
		firstCallTime = Date.now();
		func(...args);
	};
}
