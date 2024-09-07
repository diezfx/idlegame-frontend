import { loadConfig } from '$lib/config/config';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ fetch, params, locals }) => {
	let config = loadConfig();
	return {
		user: locals.user,
		config: config
	};
};
