import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async () => {
	const clientId = env.GOOGLE_CLIENT_ID;
	const redirectUri = env.GOOGLE_REDIRECT_URI;

	if (!clientId || !redirectUri) {
		return new Response('Missing Google OAuth configuration', { status: 500 });
	}

	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: 'openid email profile',
		access_type: 'offline',
		prompt: 'consent'
	});

	return new Response(null, {
		status: 302,
		headers: {
			location: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
		}
	});
};
