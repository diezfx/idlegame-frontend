import { JobSubType } from '../gen/v1/masterdata_pb';

import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param: string) => {
	const typeEnum = parseInt(param, 10);
	return Object.values(JobSubType).includes(typeEnum);
}) satisfies ParamMatcher;
