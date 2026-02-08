import log from '$lib/log/log';
import type { Handle, HandleFetch } from '@sveltejs/kit';

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
	const startTime = Date.now();
	if (!request.url.includes('/api')) {
		return fetch(request);
	}

	try {
		const result = await fetch(request);
		let bodyText: string | undefined = undefined;
		try {
			bodyText = await result.clone().text();
		} catch {
			// ignore body parsing errors
		}
		log.info('request finished', {
			url: request.url,
			status: result.status,
			method: request.method,
			duration: Date.now() - startTime,
			responseBody: bodyText,
		});
		return result;
	} catch (err) {
		log.error('backend request failed', {
			url: request.url,
			method: request.method,
			duration: Date.now() - startTime,
			error: String(err),
		});
		return new Response('backend unavailable', { status: 503 });
	}
};

export const handle: Handle = async function ({ event, resolve }) {
	event.locals.user = {
		userId: "00000000-0000-0000-0000-000000000001",
		username: 'test',
		isLoggedIn: true,
	};
	return await resolve(event, {
		filterSerializedResponseHeaders: () => true, // basically get all headers
	});
};
