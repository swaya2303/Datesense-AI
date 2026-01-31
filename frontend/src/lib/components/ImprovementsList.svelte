<script lang="ts">
	let { improvements }: { improvements: string[] } = $props();
</script>

<div class="rounded-3xl border border-amber-100 bg-white p-8 shadow-sm">
	<div class="mb-6 flex items-center gap-3">
		<div class="rounded-2xl bg-amber-50 p-3 text-amber-600">
			<!-- Arrow up circle icon -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="10" />
				<path d="m16 12-4-4-4 4" />
				<path d="M12 16V8" />
			</svg>
		</div>
		<h3 class="text-xl font-bold text-slate-800">Growing</h3>
	</div>
	<ul class="space-y-4">
		{#each improvements as improvement}
			<li class="flex items-start gap-4 leading-relaxed text-slate-600">
				<div class="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-400"></div>
				<span>{improvement}</span>
			</li>
		{/each}
	</ul>
</div>
