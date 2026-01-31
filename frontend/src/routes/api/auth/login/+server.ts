import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import clientPromise from '$lib/server/db';
import { createSession, setAuthCookie, verifyPassword } from '$lib/server/auth';
import type { ObjectId } from 'mongodb';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const data = await request.json();
		const { email, password } = data;

		if (!email || !password) {
			return json({ error: 'Email and password are required.' }, { status: 400 });
		}

		let client;
		try {
			client = await clientPromise;
		} catch (e) {
			console.error('DB Connection Failed:', e);
			return json({ error: 'Database unavailable. Connection failed.' }, { status: 503 });
		}

		if (!client) {
			return json({ error: 'Database unavailable.' }, { status: 503 });
		}

		const db = client.db();
		const user = await db.collection('users').findOne({ email });
		if (!user || !user.passwordHash) {
			return json({ error: 'Invalid credentials.' }, { status: 401 });
		}

		const isValid = await verifyPassword(password, user.passwordHash);
		if (!isValid) {
			return json({ error: 'Invalid credentials.' }, { status: 401 });
		}

		const token = await createSession(user._id as ObjectId);
		setAuthCookie(cookies, token);

		return json({ success: true });
	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
