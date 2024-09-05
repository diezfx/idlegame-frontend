import log from '$lib/log/log';
import type { Handle, HandleFetch } from '@sveltejs/kit';

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
    const startTime = Date.now();
    if (!request.url.includes('/api')) {
        return fetch(request);
    }

    const result = await fetch(request);

    log.info('request finished', {
        url: request.url,
        status: result.status,
        method: request.method,
        duration: Date.now() - startTime,
    });

    return result;
};


export const handle: Handle = async function ({ event, resolve }) {
    console.log('this is happening');
    event.locals.user = event.cookies.get('user');

    event.locals.user = {
        userId: 1,
        username: 'test',
        isLoggedIn: true,
    };
    return await resolve(event);
};
