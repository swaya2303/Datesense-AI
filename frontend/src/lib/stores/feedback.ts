import { writable } from 'svelte/store';
import type { FeedbackMetric } from '$lib/types';

export const currentFeedback = writable<FeedbackMetric | null>(null);

export function setFeedback(feedback: FeedbackMetric | null) {
	currentFeedback.set(feedback);
}

export function clearFeedback() {
	currentFeedback.set(null);
}
