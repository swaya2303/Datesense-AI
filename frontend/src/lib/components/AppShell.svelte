<script lang="ts">
	import Logo from "$lib/components/Logo.svelte";
	export let title: string;
	export let subtitle: string | null = null;
	export let primaryCta: { label: string; href: string } | null = null;
	export let secondaryCta: { label: string; href: string } | null = null;
</script>

<div class="min-h-screen bg-slate-50">
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
		<header
			class="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white/80 px-6 py-8 shadow-sm"
		>
			<div class="flex flex-col gap-3">
				<Logo class="h-8 w-auto self-start" />
				<h1 class="text-3xl font-semibold text-slate-900">{title}</h1>
				{#if subtitle}
					<p class="max-w-2xl text-base text-slate-600">{subtitle}</p>
				{/if}
			</div>
			<div class="flex flex-wrap items-center gap-3">
				{#if primaryCta}
					<a
						href={primaryCta.href}
						class="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
					>
						{primaryCta.label}
					</a>
				{/if}
				{#if secondaryCta}
					<a
						href={secondaryCta.href}
						class="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
					>
						{secondaryCta.label}
					</a>
				{/if}
			</div>
		</header>

		<slot />
	</div>
</div>
