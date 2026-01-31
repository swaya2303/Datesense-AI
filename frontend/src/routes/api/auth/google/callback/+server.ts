import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import clientPromise from '$lib/server/db';
import { createSession, setAuthCookie } from '$lib/server/auth';
import { ObjectId } from 'mongodb';

interface GoogleTokenResponse {
	access_token: string;
	id_token: string;
}

interface GoogleUserInfo {
	sub: string;
	email: string;
	email_verified: boolean;
}

export const GET: RequestHandler = async ({ url, cookies }) => {
	try {
		const code = url.searchParams.get('code');
		if (!code) {
			return json({ error: 'Missing code' }, { status: 400 });
		}

		const clientId = env.GOOGLE_CLIENT_ID;
		const clientSecret = env.GOOGLE_CLIENT_SECRET;
		const redirectUri = env.GOOGLE_REDIRECT_URI;

		if (!clientId || !clientSecret || !redirectUri) {
			return json({ error: 'Google OAuth not configured' }, { status: 500 });
		}

		const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				code,
				client_id: clientId,
				client_secret: clientSecret,
				redirect_uri: redirectUri,
				grant_type: 'authorization_code'
			})
		});

		if (!tokenResponse.ok) {
			return json({ error: 'Failed to exchange code' }, { status: 400 });
		}

		const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;
		const userInfoResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: { Authorization: `Bearer ${tokenData.access_token}` }
		});

		if (!userInfoResponse.ok) {
			return json({ error: 'Failed to fetch user info' }, { status: 400 });
		}

		const userInfo = (await userInfoResponse.json()) as GoogleUserInfo;
		if (!userInfo.email) {
			return json({ error: 'Google account missing email' }, { status: 400 });
		}

		let client;
		try {
			client = await clientPromise;
		} catch (e) {
			console.error('DB Connection Failed:', e);
			return json({ error: 'Database unavailable. Connection failed.' }, { status: 503 });
		}

		if (!client) {
			return json({ error: 'Database unavailable' }, { status: 503 });
		}

		const db = client.db();
		const existing = await db.collection('users').findOne({ email: userInfo.email });

		let userId: ObjectId;
		if (existing) {
			if (!existing.googleId) {
				await db.collection('users').updateOne(
					{ _id: existing._id },
					{ $set: { googleId: userInfo.sub, provider: existing.provider ?? 'google' } }
				);
			}
			userId = existing._id;
		} else {
			const result = await db.collection('users').insertOne({
				email: userInfo.email,
				googleId: userInfo.sub,
				provider: 'google',
				createdAt: new Date()
			});
			userId = result.insertedId;
		}

		const token = await createSession(userId);
		setAuthCookie(cookies, token);

		return new Response(null, {
			status: 302,
			headers: { location: '/dashboard' }
		});
	} catch (error) {
		console.error('Google auth error:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
