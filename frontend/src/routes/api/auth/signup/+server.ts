import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import clientPromise from '$lib/server/db';
import { createSession, hashPassword, setAuthCookie } from '$lib/server/auth';
import { ObjectId } from 'mongodb';

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
			return json({ error: 'Database unavailable. Check MONGODB_URI.' }, { status: 503 });
		}

		const db = client.db();
		const existing = await db.collection('users').findOne({ email });
		const passwordHash = await hashPassword(password);

		let userId: ObjectId;
		if (existing) {
			if (existing.passwordHash) {
				return json({ error: 'Account already exists. Please log in.' }, { status: 409 });
			}
			await db.collection('users').updateOne(
				{ _id: existing._id },
				{ $set: { passwordHash, provider: 'email' } }
			);
			userId = existing._id;
		} else {
			const result = await db.collection('users').insertOne({
				email,
				passwordHash,
				provider: 'email',
				createdAt: new Date()
			});
			userId = result.insertedId;
		}

		const token = await createSession(userId);
		setAuthCookie(cookies, token);

		return json({ success: true });
	} catch (error) {
		console.error('Signup error:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
