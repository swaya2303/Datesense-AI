import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { clearAuthCookie, clearSession, getAuthCookie } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
	try {
		const token = getAuthCookie(cookies);
		await clearSession(token);
		clearAuthCookie(cookies);
		return json({ success: true });
	} catch (error) {
		console.error('Logout error:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
