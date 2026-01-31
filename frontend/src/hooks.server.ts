import { redirect, type Handle } from '@sveltejs/kit';
import { getAuthCookie, getSessionUser } from '$lib/server/auth';

const protectedRoutePrefixes = ['/dashboard', '/lab', '/textMentor', '/session', '/rewind'];

const isProtectedRoute = (path: string) => {
	return protectedRoutePrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
};

export const handle: Handle = async ({ event, resolve }) => {
	const token = getAuthCookie(event.cookies);
	const user = await getSessionUser(token);
	event.locals.user = user;

	const path = event.url.pathname;
	if (!user && isProtectedRoute(path)) {
		throw redirect(302, '/login');
	}

	return resolve(event);
};
