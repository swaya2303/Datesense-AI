<script lang="ts">
	import type { TranscriptEntry } from '$lib/types';

	let { entry }: { entry: TranscriptEntry } = $props();
</script>

<div class="flex gap-4 {entry.speaker === 'user' ? 'flex-row-reverse' : ''}">
	<div
		class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm {entry.speaker ===
		'user'
			? 'bg-indigo-100 text-indigo-600'
			: 'bg-rose-100 text-rose-600'}"
	>
		{entry.speaker === 'user' ? 'ME' : 'AI'}
	</div>
	<div
		class="max-w-[85%] rounded-3xl px-5 py-3 text-base leading-relaxed shadow-sm {entry.speaker ===
		'user'
			? 'rounded-tr-none bg-indigo-600 text-white'
			: 'rounded-tl-none bg-slate-100 text-slate-800'}"
	>
		{entry.text}
	</div>
</div>
