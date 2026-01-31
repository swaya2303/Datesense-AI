import { writable } from 'svelte/store';
import type { TranscriptEntry } from '$lib/types';

export const transcript = writable<TranscriptEntry[]>([]);

export function addTranscriptEntry(speaker: 'user' | 'ai', text: string) {
	transcript.update((entries) => {
		const last = entries[entries.length - 1];
		// If the speaker is the same as the last entry, append text to it
		// instead of creating a new entry. This prevents "individual letter" bubbles.
		if (last && last.speaker === speaker) {
			return [...entries.slice(0, -1), { ...last, text: last.text + text }];
		}
		// Otherwise, start a new speech bubble
		return [...entries, { speaker, text }];
	});
}

export function clearTranscript() {
	transcript.set([]);
}

export function popLastUserEntry() {
	transcript.update((entries) => {
		if (entries.length > 0 && entries[entries.length - 1].speaker === 'user') {
			return entries.slice(0, -1);
		}
		return entries;
	});
}


