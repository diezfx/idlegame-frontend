import { config } from '$lib/config/config';
import log from '$lib/log/log';
import { clients } from '$lib/service/connect';
import { redirect, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ fetch, parent, params, url, locals }) => {
	console.log('Layout.server load lalala');
	const { userClient } = clients;

	const user = locals.user
	const tutorialProgress = await userClient.getUserProgress({ id: BigInt(user.userId) });

	if (!tutorialProgress.tutorialCompleted && url.pathname !== '/tutorial') {
		log.info(`User ${user.userId} has not completed the tutorial, redirecting to /tutorial`);
		throw redirect(302, `/tutorial`);
	}
	return {
		user: locals.user,
		config: config,
	};
};
