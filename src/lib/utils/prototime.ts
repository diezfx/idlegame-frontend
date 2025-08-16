import type { Duration, Timestamp } from '@bufbuild/protobuf/wkt';

export function protoToMilliseconds(ts?: Duration | Timestamp): number {
	if (!ts) {
		return 0;
	}
	const milliseconds = ts.seconds * 1000n + BigInt(BigInt(ts.nanos) / 1000000n);
	return Number(milliseconds);
}
