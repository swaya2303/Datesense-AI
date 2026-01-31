import { writable } from 'svelte/store';
import type { SessionConfig, SessionStats } from '$lib/types';

export const sessionConfig = writable<SessionConfig | null>(null);
export const sessionStats = writable<SessionStats | null>(null);
export const isSessionActive = writable<boolean>(false);
export const sessionStartTime = writable<number | null>(null);
