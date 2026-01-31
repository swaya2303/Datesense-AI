<script lang="ts">
	export let eyebrow: string | null = null;
	export let title: string;
	export let description: string | null = null;
</script>

<section class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
	{#if eyebrow}
		<p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{eyebrow}</p>
	{/if}
	<h2 class="text-xl font-semibold text-slate-900">{title}</h2>
	{#if description}
		<p class="text-sm text-slate-600">{description}</p>
	{/if}
	<slot />
</section>
