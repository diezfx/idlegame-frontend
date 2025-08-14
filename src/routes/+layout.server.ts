import { config } from '$lib/config/config';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ fetch, params, locals }) => {
	return {
		user: locals.user,
		config: config,
	};
};
