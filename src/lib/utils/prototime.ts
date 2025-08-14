import type { Timestamp } from '@bufbuild/protobuf/wkt';

export function protoToMilliseconds(ts: Timestamp): number {
    const milliseconds = ts.seconds * 1000n + BigInt(ts.nanos / 1000000);
    return Number(milliseconds);
}
