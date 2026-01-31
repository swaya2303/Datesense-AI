// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: {
				id: unknown;
				email: string;
				provider?: string;
				googleId?: string | null;
			} | null;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// eslint-disable-next-line no-var
	var _mongoClientPromise: Promise<import('mongodb').MongoClient> | undefined;
}

export {};
