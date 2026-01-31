import { createHmac, randomBytes } from 'crypto';
import type { Cookies } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';
import clientPromise from '$lib/server/db';
import pkg from 'bcryptjs';

const { compare, hash } = pkg;

const SESSION_COOKIE = 'session';
const SESSION_TTL_DAYS = 7;

const getAuthSecret = () => {
	const secret = env.AUTH_SECRET;
	if (!secret) {
		throw new Error('AUTH_SECRET is not set');
	}
	return secret;
};

const signToken = (value: string) => {
	const secret = getAuthSecret();
	return createHmac('sha256', secret).update(value).digest('hex');
};

const buildToken = (sessionId: string) => {
	return `${sessionId}.${signToken(sessionId)}`;
};

const parseToken = (token: string | undefined) => {
	if (!token) return null;
	const [sessionId, signature] = token.split('.');
	if (!sessionId || !signature) return null;
	const expected = signToken(sessionId);
	if (expected !== signature) return null;
	return sessionId;
};

export const hashPassword = async (password: string) => {
	return hash(password, 12);
};

export const verifyPassword = async (password: string, passwordHash: string) => {
	return compare(password, passwordHash);
};

export const createSession = async (userId: ObjectId) => {
	const client = await clientPromise;
	if (!client) throw new Error('MongoDB unavailable');
	const db = client.db();
	const sessionId = randomBytes(24).toString('hex');
	const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
	await (db.collection('sessions') as any).insertOne({
		_id: sessionId,
		userId,
		expiresAt,
		createdAt: new Date()
	});
	return buildToken(sessionId);
};

export const toObjectId = (value: string | ObjectId) =>
	value instanceof ObjectId ? value : new ObjectId(value);


export const getSessionUser = async (token: string | undefined) => {
	const sessionId = parseToken(token);
	if (!sessionId) return null;
	const client = await clientPromise;
	if (!client) return null;
	const db = client.db();
	const session = await (db.collection('sessions') as any).findOne({ _id: sessionId });
	if (!session) return null;
	if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
	await (db.collection('sessions') as any).deleteOne({ _id: sessionId });

		return null;
	}
	const user = await (db.collection('users') as any).findOne({ _id: session.userId });
	if (!user) return null;
	return {
		id: user._id?.toString?.() ?? String(user._id),
		email: user.email,
		provider: user.provider,
		googleId: user.googleId ?? null
	};
};

export const clearSession = async (token: string | undefined) => {
	const sessionId = parseToken(token);
	if (!sessionId) return;
	const client = await clientPromise;
	if (!client) return;
	const db = client.db();
	await (db.collection('sessions') as any).deleteOne({ _id: sessionId });
};

export const setAuthCookie = (cookies: Cookies, token: string) => {
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: env.NODE_ENV === 'production' || env.NODE_ENV === 'prod',
		maxAge: SESSION_TTL_DAYS * 24 * 60 * 60
	});
};

export const clearAuthCookie = (cookies: Cookies) => {
	cookies.delete(SESSION_COOKIE, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: env.NODE_ENV === 'production' || env.NODE_ENV === 'prod'
	});
};

export const getAuthCookie = (cookies: Cookies) => cookies.get(SESSION_COOKIE);

export const ensureUserCollection = async () => {
	const client = await clientPromise;
	if (!client) return;
	const db = client.db();
	await db.collection('users').createIndex({ email: 1 }, { unique: true });
};
