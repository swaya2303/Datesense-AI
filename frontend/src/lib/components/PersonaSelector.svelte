<script lang="ts">
	import type { Persona } from '$lib/types';
	import { personas } from '$lib/data/personas';
	import AlexIcon from '$lib/components/persona-icons/AlexIcon.svelte';
	import SarahIcon from '$lib/components/persona-icons/SarahIcon.svelte';
	import KittenIcon from '$lib/components/persona-icons/KittenIcon.svelte';

	let { selected = $bindable<Persona | null>(null) }: { selected?: Persona | null } = $props();

	const personaIcons: Record<Persona, typeof AlexIcon> = {
		male: AlexIcon,
		female: SarahIcon,
		discord_kitten: KittenIcon
	};

	function selectPersona(id: Persona) {
		selected = id;
	}
</script>

<div class="space-y-4">
	{#each personas as persona}
		<button
			type="button"
			onclick={() => selectPersona(persona.id)}
			class="w-full rounded-3xl border-4 p-4 text-left transition-all {selected === persona.id
				? 'border-mblue bg-lblue'
				: 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'}"
		>
			<div class="flex items-center gap-4">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-full {persona.color}"
				>
					<svelte:component
						this={personaIcons[persona.id]}
						class="h-9 w-9"
					/>
				</div>
				<div class="flex-1">
					<div class="text-2xl font-semibold text-slate-800">{persona.name}</div>
					<div class="text-xl text-slate-500">{persona.description}</div>
				</div>
        <p class="text-mblue mr-2">●</p>
			</div>
		</button>
	{/each}
</div>
