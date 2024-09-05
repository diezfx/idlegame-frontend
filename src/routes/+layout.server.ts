import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ fetch, params, locals }) => {
	return {
		user: locals.user,
	};
};
