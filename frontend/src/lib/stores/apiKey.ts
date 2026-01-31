import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'datesense_ai_gemini_api_key';

function createApiKeyStore() {
	const initial = browser ? localStorage.getItem(STORAGE_KEY) || '' : '';
	const { subscribe, set } = writable(initial);

	return {
		subscribe,
		set: (value: string) => {
			if (browser) {
				localStorage.setItem(STORAGE_KEY, value);
			}
			set(value);
		},
		clear: () => {
			if (browser) {
				localStorage.removeItem(STORAGE_KEY);
			}
			set('');
		}
	};
}

export const geminiApiKey = createApiKeyStore();
