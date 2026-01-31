import { redirect } from '@sveltejs/kit';

const protectedRoutePrefixes = ['/dashboard', '/lab', '/textMentor', '/session', '/rewind'];

const isProtectedRoute = (path: string) =>
	protectedRoutePrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

export const load = ({ locals, url }: { locals: App.Locals; url: URL }) => {
	if (!locals.user && isProtectedRoute(url.pathname)) {
		throw redirect(302, '/login');
	}

	return {
		user: locals.user
			? {
				id: String(locals.user.id),
				email: locals.user.email,
				provider: locals.user.provider,
				googleId: locals.user.googleId ?? null
			}
			: null
	};
};
