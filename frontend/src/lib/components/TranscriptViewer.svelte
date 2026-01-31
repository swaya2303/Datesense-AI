<script lang="ts">
	import type { TranscriptEntry } from '$lib/types';
	import TranscriptBubble from './TranscriptBubble.svelte';

	let { entries }: { entries: TranscriptEntry[] } = $props();

	let containerRef: HTMLDivElement | null = $state(null);

	// Auto-scroll to bottom when new entries come in
	$effect(() => {
		if (containerRef && entries.length > 0) {
			containerRef.scrollTop = containerRef.scrollHeight;
		}
	});
</script>

<div
	bind:this={containerRef}
	class="max-h-[500px] space-y-6 overflow-y-auto p-6 md:p-8"
>
	{#if entries.length > 0}
		{#each entries as entry, i (i)}
			<TranscriptBubble {entry} />
		{/each}
	{:else}
		<div class="py-12 text-center">
			<p class="italic text-slate-400">No conversation recorded yet.</p>
		</div>
	{/if}
</div>
