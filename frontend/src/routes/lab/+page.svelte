<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Persona, Scenario } from '$lib/types';
	import { sessionConfig } from '$lib/stores/session';
	import { clearTranscript } from '$lib/stores/transcript';
	import PersonaSelector from '$lib/components/PersonaSelector.svelte';
	import ScenarioSelector from '$lib/components/ScenarioSelector.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import AlexIcon from '$lib/components/persona-icons/AlexIcon.svelte';
	import SarahIcon from '$lib/components/persona-icons/SarahIcon.svelte';
	import KittenIcon from '$lib/components/persona-icons/KittenIcon.svelte';
	import ArrowIcon from '$lib/components/ArrowIcon.svelte';
	import { scenarios } from '$lib/data/scenarios';

	let selectedPersona = $state<Persona | null>(null);
	let selectedScenario = $state<Scenario | null>(null);
	let step = $state<'persona' | 'scenario'>('persona');
	let containerRef: HTMLDivElement | null = null;

	const personaIcons: Record<Persona, typeof AlexIcon> = {
		male: AlexIcon,
		female: SarahIcon,
		discord_kitten: KittenIcon
	};

	const scenarioIconSvg: Record<Scenario, string> = {
		coffee_shop: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M10 2v2" />
				<path d="M14 2v2" />
				<path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
				<path d="M6 2v2" />
			</svg>
		`,
		restaurant: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
				<path d="M7 2v20" />
				<path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
			</svg>
		`,
		video_call: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
				<rect x="2" y="6" width="14" height="12" rx="2" />
			</svg>
		`
	};

	const scenarioIcon = $derived(
		selectedScenario ? scenarioIconSvg[selectedScenario] : scenarioIconSvg.coffee_shop
	);

	const scenarioName = $derived(
		scenarios.find((scenario) => scenario.id === selectedScenario)?.name ?? 'Select a Scene'
	);

	function startSession() {
		if (selectedPersona && selectedScenario) {
			sessionConfig.set({ persona: selectedPersona, scenario: selectedScenario });
			clearTranscript();
			goto('/session');
		}
	}

	function goToScenarioStep() {
		if (selectedPersona) {
			step = 'scenario';
			retriggerAnimation(containerRef);
		}
	}

	function retriggerAnimation(el: HTMLElement | null) {
		if (!el) return;
		el.classList.remove('animate-slide-in');
		void el.offsetWidth;
		el.classList.add('animate-slide-in');
	}

	function goToPersonaStep() {
		step = 'persona';
		retriggerAnimation(containerRef);
	}
</script>

<div class="flex min-h-screen flex-col bg-slate-50">
	<header class="w-full bg-white px-6 py-4 shadow-sm">
		<a href="/" class="inline-flex items-center">
			<Logo class="h-10 w-auto" />
		</a>
	</header>

	<div class="flex flex-1 items-center justify-center p-6">
		<div
			bind:this={containerRef}
			class="animate-slide-in border-4 border-mblue flex min-h-[600px] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl md:flex-row"
		>

		<!-- Left Panel: Step Content -->
		<div
			class="flex flex-1 flex-col border-b border-slate-100 p-8 md:border-b-0 md:border-r md:p-12"
		>
			{#if step === 'persona'}
				<h2 class="mb-6 text-3xl font-semibold text-slate-800">1. Choose Partner</h2>
				<div class="flex-1">
					<PersonaSelector bind:selected={selectedPersona} />
				</div>

				<div class="">
					<button
						type="button"
						disabled={!selectedPersona}
						onclick={goToScenarioStep}
            class="text-2xl text-center font-medium sm:w-70 w-48 mt-7 mb-4 p-3 drop-shadow-xl rounded-full bg-lblue transition-all hover:bg-mblue disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
          >
						Next
						<ArrowIcon />
					</button>
				</div>
			{:else}
				<h2 class="mb-6 text-2xl font-bold text-slate-800">2. Set Scene</h2>
				<div class="flex-1">
					<ScenarioSelector bind:selected={selectedScenario} />
				</div>

				<div class="mt-8 pt-6 space-y-3">
					<button
						type="button"
						onclick={goToPersonaStep}	
          class="text-2xl text-center font-medium sm:w-70 w-48 mb-4 p-3 drop-shadow-xl rounded-full bg-white transition-all hover:bg-mblue disabled:cursor-not-allowed disabled:opacity-50"
          >
						Back
					</button>
					<button
						type="button"
						disabled={!selectedPersona || !selectedScenario}
						onclick={startSession}
            class="text-2xl text-center font-medium sm:w-70 w-48 mt-2 mb-4 p-3 drop-shadow-xl rounded-full bg-lblue transition-all hover:bg-mblue disabled:cursor-not-allowed disabled:opacity-50"
          >
						Start Session
					</button>
				</div>
			{/if}
		</div>

		<!-- Right Panel: Preview -->
		<div class="flex flex-1 items-center justify-center bg-slate-100 p-8 md:p-12">
			{#if step === 'persona'}
				{#if selectedPersona}
					{#key selectedPersona}
						<svelte:component
							this={personaIcons[selectedPersona]}
							class="w-full max-w-[360px] animate-fade-in"
						/>
					{/key}
				{/if}
			{:else}
				<div class="flex h-full w-full flex-col items-center justify-center gap-6">
					{#key selectedScenario}
						<div class="flex h-48 w-48 items-center justify-center animate-fade-in">
							{@html scenarioIcon}
						</div>
					{/key}
					<p class="text-xl font-semibold text-slate-700">{scenarioName}</p>
				</div>
			{/if}
		</div>
	</div>
</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.25s ease-out;
	}
</style>
