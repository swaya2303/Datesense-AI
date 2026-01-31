<script lang="ts">
	import { elevenLabsService, ElevenLabsService } from '$lib/services/elevenLabs';
	import Logo from '$lib/components/Logo.svelte';
	import SectionCard from '$lib/components/SectionCard.svelte';

	let text = $state('');
	let selectedVoice = $state(ElevenLabsService.VOICES.FEMALE);
	let isLoading = $state(false);
	let error = $state('');
	let audioUrl = $state<string | null>(null);
	let showApiKeyNotice = $state(!elevenLabsService.hasApiKey());

	const voices = [
		{ id: ElevenLabsService.VOICES.FEMALE, name: 'Clear Female (Rachel)' },
		{ id: ElevenLabsService.VOICES.MALE, name: 'Clear Male (Adam)' }
	];


	async function handleSpeak() {
		if (!text.trim()) return;

		isLoading = true;
		error = '';
		audioUrl = null;

		try {
			const blob = await elevenLabsService.convertTextToSpeech(text, selectedVoice);
			audioUrl = URL.createObjectURL(blob);
		} catch (e: any) {
			console.error(e);
			error = e.message || 'Something went wrong. Please check your API key and try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="animate-slide-in flex min-h-screen flex-col bg-slate-50">
	<header class="w-full bg-white px-6 py-4 shadow-sm">
		<a href="/" class="inline-flex items-center">
			<Logo class="h-10 w-auto" />
		</a>
	</header>

	<div class="flex flex-1 items-center justify-center p-6">
		<div class="border-4 border-mblue flex min-h-[600px] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl md:flex-row">
			<div class="flex flex-1 flex-col border-b border-slate-100 p-8 md:border-b-0 md:border-r md:p-12">
				<div class="mb-8 text-left">
					<h1 class="text-3xl font-semibold text-slate-800">Text Mentor</h1>
					<p class="mt-2 text-lg text-slate-600">
						Listen to messages in a clear, calm voice to help process tone and meaning.
					</p>
				</div>

				<SectionCard
					eyebrow="Input"
					title="What would you like to hear?"
					description="Paste a text message or type a thought below."
				>
					<div class="space-y-6">
						<textarea
							bind:value={text}
							placeholder="Type something here..."
							rows="5"
							class="w-full resize-y rounded-xl border border-slate-200 bg-white p-4 text-lg leading-relaxed text-slate-800 placeholder-slate-400 shadow-sm focus:border-mblue focus:ring-mblue"
						></textarea>

						<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
							<div class="flex items-center gap-4">
								<span class="text-sm font-medium text-slate-600">Voice:</span>
								<div class="flex rounded-lg bg-slate-100 p-1">
									{#each voices as voice}
										<button
											class="rounded-md px-4 py-2 text-sm font-medium transition-all {selectedVoice ===
											voice.id
												? 'bg-white text-slate-800 shadow-sm'
												: 'text-slate-600 hover:text-slate-900'}"
											onclick={() => (selectedVoice = voice.id)}
										>
											{voice.name}
										</button>
									{/each}
								</div>
							</div>

							<button
								onclick={handleSpeak}
								disabled={isLoading || !text.trim()}
								class="text-2xl text-center font-medium w-70 p-3 drop-shadow-xl rounded-full bg-lblue transition-all hover:bg-mblue disabled:cursor-not-allowed disabled:opacity-50"
							>
								{#if isLoading}
									Generating...
								{:else}
									Read Aloud
								{/if}
							</button>
						</div>

						{#if error}
							<div class="rounded-lg bg-red-50 p-4 text-center text-red-600">
								{error}
							</div>
						{/if}

						{#if audioUrl}
							<div class="mt-6 rounded-xl border border-mblue bg-lblue/40 p-6 text-center animate-fade-in">
								<p class="mb-3 text-sm font-medium text-slate-800">Audio Ready</p>
								<audio controls autoplay src={audioUrl} class="w-full">
									Your browser does not support the audio element.
								</audio>
							</div>
						{/if}
					</div>
				</SectionCard>
			</div>

		</div>
	</div>
</div>

<style>
	/* Minimal fade animation */
	@keyframes fade-in {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.animate-fade-in {
		animation: fade-in 0.3s ease-out forwards;
	}
</style>
