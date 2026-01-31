<script lang="ts">
	let { strengths }: { strengths: string[] } = $props();
</script>

<div class="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
	<div class="mb-6 flex items-center gap-3">
		<div class="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
			<!-- Sparkles icon -->
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
				<path
					d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
				/>
			</svg>
		</div>
		<h3 class="text-xl font-bold text-slate-800">Glowing</h3>
	</div>
	<ul class="space-y-4">
		{#each strengths as strength}
			<li class="flex items-start gap-4 leading-relaxed text-slate-600">
				<!-- Check circle icon -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="mt-0.5 shrink-0 text-emerald-500"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="m9 12 2 2 4-4" />
				</svg>
				<span>{strength}</span>
			</li>
		{/each}
	</ul>
</div>
