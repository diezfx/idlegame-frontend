import type { Timestamp } from '@bufbuild/protobuf/wkt';

export function protoToMilliseconds(ts: Timestamp): BigInt {
	const milliseconds = ts.seconds * 1000n + BigInt(ts.nanos / 1000000);
	return milliseconds;
}
