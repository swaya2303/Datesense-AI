import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const data = await request.json();
        const { userId, sessionId, transcription } = data;

        if (!userId || !transcription) {
            return json({ error: 'Missing required fields: userId, transcription' }, { status: 400 });
        }

		let client;
		try {
			client = await clientPromise;
		} catch (e) {
			console.error('DB Connection Failed:', e);
			return json({ error: 'Database unavailable' }, { status: 503 });
		}

		if (!client) {
			return json({ error: 'Database unavailable' }, { status: 503 });
		}
		const db = client.db();

        const collection = db.collection('transcriptions');

        const result = await collection.insertOne({
            userId,
            sessionId: sessionId || 'unknown',
            transcription,
            timestamp: new Date()
        });

        return json({ success: true, id: result.insertedId }, { status: 201 });
    } catch (e) {
        console.error('Error saving transcription:', e);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
