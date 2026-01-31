<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { goto } from "$app/navigation";
	import { browser } from "$app/environment";
	import { get } from "svelte/store";
	import type {
		FeedbackMetric,
		SessionStats,
		SessionConfig,
	} from "$lib/types";
	import {
		sessionConfig,
		sessionStats,
		sessionStartTime,
	} from "$lib/stores/session";
	import { geminiApiKey } from "$lib/stores/apiKey";
	import {
		transcript,
		addTranscriptEntry,
		clearTranscript,
		popLastUserEntry,
	} from "$lib/stores/transcript";
	import {
		currentFeedback,
		setFeedback,
		clearFeedback,
	} from "$lib/stores/feedback";
	import { LiveSessionClient } from "$lib/services/liveClient";
	import { analyzeTranscript } from "$lib/services/transcriptAnalyzer";
	import {
		elevenLabsService,
		ElevenLabsService,
	} from "$lib/services/elevenLabs";
	import { getPersonaDisplayName } from "$lib/data/personas";
	import { getScenarioDisplayName } from "$lib/data/scenarios";
	import Logo from "$lib/components/Logo.svelte";
	import EndCallButton from "$lib/components/EndCallButton.svelte";
	import SessionControls from "$lib/components/SessionControls.svelte";
	import ThrelteScene from "$lib/components/ThrelteScene.svelte";
	import MoodOverlay from "$lib/components/MoodOverlay.svelte";
	import SubtitlesOverlay from "$lib/components/SubtitlesOverlay.svelte";

	let videoRef: HTMLVideoElement | null = $state(null);
	let isConnected = $state(false);
	let isAnalyzing = $state(false);
	let micActive = $state(true);
	let client: LiveSessionClient | null = null;
	let videoStream: MediaStream | null = null;
	let feedbackInterval: number | null = null;

	let config = $state<SessionConfig | null>(null);
	let personaName = $state("");
	let scenarioName = $state("");
	let personaKey = $state<SessionConfig["persona"] | null>(null);
	let apiKey = $state("");

	// Wingman state
	let wingmanLoading = $state(false);
	let wingmanOptions = $state<{
		pivot: string;
		joke: string;
		question: string;
	} | null>(null);
	let showWingmanModal = $state(false);
	let wingmanTimeout: number | null = null;

	// Toast notification state
	let toastMessage = $state<string | null>(null);
	let toastTimeout: number | null = null;
	let showSpacebarHint = $state(true);

	// Subtitle/transcript display state
	let showSubtitles = $state(true);

	function showToast(message: string, duration = 3000) {
		toastMessage = message;
		if (toastTimeout) clearTimeout(toastTimeout);
		toastTimeout = window.setTimeout(() => {
			toastMessage = null;
		}, duration);
	}

	async function selectWingmanOption(
		optionType: "pivot" | "joke" | "question",
		text: string,
	) {
		showWingmanModal = false;
		wingmanOptions = null;
		if (wingmanTimeout) {
			clearTimeout(wingmanTimeout);
			wingmanTimeout = null;
		}

		// "Clear speech" effect: remove the stutter/silence from before
		// Do this BEFORE injecting new audio to ensure we don't pop the new transcription if it comes back fast
		popLastUserEntry();

		if (client) {
			client.setMicMuted(true);
			try {
				const audioBlob = await elevenLabsService.convertTextToSpeech(
					text,
					ElevenLabsService.VOICES.MALE,
				);
				await client.injectAudioFromBlob(audioBlob);
			} catch (e) {
				console.error("Wingman TTS injection failed:", e);
				showToast("Failed to send audio to AI", 2000);
			} finally {
				if (client) client.setMicMuted(false);
			}
		}

		const labels = {
			pivot: "🔄 Pivot Sent",
			joke: "😄 Joke Sent",
			question: "❓ Question Sent",
		};
		showToast(`${labels[optionType]} to AI! Mic muted.`);

		// Note: We do NOT manually addTranscriptEntry here.
		// The server will hear the injected audio and send back an inputTranscription event,
		// which will naturally add it to the transcript.
	}

	async function handleWingmanRequest() {
		if (wingmanLoading || !isConnected) return;

		wingmanLoading = true;
		showWingmanModal = true;

		try {
			const currentTranscript = get(transcript);
			const transcriptText = currentTranscript
				.map(
					(entry) =>
						`${entry.speaker === "user" ? "User" : "Date"}: ${entry.text}`,
				)
				.join("\n");

			const response = await fetch("/api/wingman", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ transcript: transcriptText }),
			});

			const options = await response.json();
			wingmanOptions = options;

			if (wingmanTimeout) clearTimeout(wingmanTimeout);
			wingmanTimeout = window.setTimeout(() => {
				showWingmanModal = false;
				wingmanOptions = null;
			}, 10000);
		} catch (error) {
			console.error("Wingman request failed:", error);
			wingmanOptions = {
				pivot: "That reminds me - what do you think about...?",
				joke: "Why don't eggs tell jokes? They'd crack each other up!",
				question: "What's something you've always wanted to try?",
			};
		} finally {
			wingmanLoading = false;
		}
	}

	function dismissWingman() {
		showWingmanModal = false;
		wingmanOptions = null;
		if (wingmanTimeout) {
			clearTimeout(wingmanTimeout);
			wingmanTimeout = null;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (
			event.code === "Space" &&
			!(
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement
			)
		) {
			event.preventDefault();
			handleWingmanRequest();
		}
		if (event.code === "Escape" && showWingmanModal) {
			dismissWingman();
		}
	}

	//  personaKey = $state<SessionConfig['persona'] | null>(null);

	// Mock stats generator
	function generateMockStats(): SessionStats {
		const currentTranscript = get(transcript);
		const startTime = get(sessionStartTime) || Date.now();
		const duration = Math.floor((Date.now() - startTime) / 1000);

		const strengthsPool = [
			"You maintained a warm and inviting tone throughout the conversation.",
			"Your pacing was excellent - not too fast, not too slow.",
			"You asked thoughtful follow-up questions that showed genuine interest.",
			"Your body language appeared open and engaged.",
			"You handled pauses naturally without rushing to fill silence.",
			"Your responses were well-structured and easy to follow.",
			"Your eye contact was great!",
		];

		const improvementsPool = [
			"Try maintaining eye contact for slightly longer periods.",
			"Consider taking a breath before responding to complex questions.",
			"Practice active listening cues like nodding or brief verbal affirmations.",
			"Work on varying your vocal tone to add more expressiveness.",
			"Try to relax your shoulders during intense moments.",
			"You did a great job of recovering after a small stumble.",
		];

		// Random selection
		const shuffledStrengths = [...strengthsPool].sort(
			() => Math.random() - 0.5,
		);
		const shuffledImprovements = [...improvementsPool].sort(
			() => Math.random() - 0.5,
		);

		return {
			duration,
			score: Math.floor(Math.random() * 20) + 80,
			strengths: shuffledStrengths.slice(0, 3),
			improvements: shuffledImprovements.slice(0, 2),
			transcript: currentTranscript,
		};
	}

	// Biometric feedback simulation
	function startFeedbackLoop() {
		feedbackInterval = window.setInterval(() => {
			if (!isConnected) return;

			const r = Math.random();
			if (r > 0.95) {
				setFeedback({
					timestamp: Date.now(),
					type: "eye_contact",
					message: "Gentle reminder: Try to look at the camera.",
					severity: "info",
				});
			} else if (r > 0.9 && r < 0.92) {
				setFeedback({
					timestamp: Date.now(),
					type: "pacing",
					message: "Great pacing! You are speaking clearly.",
					severity: "success",
				});
			} else if (r < 0.05) {
				setFeedback({
					timestamp: Date.now(),
					type: "posture",
					message: "Relax your shoulders, take a deep breath.",
					severity: "info",
				});
			} else if (Math.random() > 0.7) {
				clearFeedback();
			}
		}, 4000);
	}

	async function initSession() {
		if (!config || !videoRef) return;

		try {
			// Setup Video
			videoStream = await navigator.mediaDevices.getUserMedia({
				video: true,
			});
			videoRef.srcObject = videoStream;
			await videoRef.play();

			if (browser) {
				window.addEventListener("keydown", handleKeydown);
			}
			// Record start time
			sessionStartTime.set(Date.now());
			clearTranscript();

			// Setup Client
			client = new LiveSessionClient(apiKey);
			await client.connect(
				config.scenario,
				config.persona,
				videoRef,
				(speaker, text) => {
					addTranscriptEntry(speaker, text);
				},
				() => {
					handleEndSession();
				},
			);

			isConnected = true;
			startFeedbackLoop();
		} catch (err) {
			console.error("Failed to init session:", err);
		}
	}

	async function handleEndSession() {
		// Prevent double-triggering
		if (isAnalyzing) return;

		isAnalyzing = true;

		const currentTranscript = get(transcript);
		const startTime = get(sessionStartTime) || Date.now();
		const duration = Math.floor((Date.now() - startTime) / 1000);

		// Stop the session resources
		cleanup();

		try {
			const currentConfig = get(sessionConfig);
			if (!currentConfig) {
				throw new Error("Session config not found");
			}

			// Call Gemini for analysis
			const analysis = await analyzeTranscript(
				currentTranscript,
				currentConfig.scenario,
				currentConfig.persona,
				apiKey,
			);

			const stats: SessionStats = {
				duration,
				score: analysis.score,
				strengths: analysis.strengths,
				improvements: analysis.improvements,
				transcript: currentTranscript,
			};

			sessionStats.set(stats);

			// Save to Database
			try {
				const userId =
					localStorage.getItem("datesense_user_id") ||
					crypto.randomUUID();
				localStorage.setItem("datesense_user_id", userId);

				// Save Score
				await fetch("/api/scores", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						userId,
						score: analysis.score,
						metadata: {
							scenario: currentConfig.scenario,
							persona: currentConfig.persona,
							duration,
						},
					}),
				});

				// Save Transcription
				await fetch("/api/transcriptions", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						userId,
						sessionId: crypto.randomUUID(), // New session ID for this specific run
						transcription: JSON.stringify(currentTranscript),
					}),
				});
			} catch (dbError) {
				console.error("Failed to save to database:", dbError);
				// Continue anyway, don't block the user from seeing results
			}
		} catch (error) {
			console.error("Analysis failed:", error);

			// Fallback to empty feedback
			const stats: SessionStats = {
				duration,
				score: 0,
				strengths: ["Session too short or analysis failed"],
				improvements: ["Try speaking more next time"],
				transcript: currentTranscript,
			};
			sessionStats.set(stats);
		}

		goto("/rewind");
	}

	function cleanup() {
		if (feedbackInterval) {
			clearInterval(feedbackInterval);
			feedbackInterval = null;
		}

		if (videoStream) {
			videoStream.getTracks().forEach((t) => t.stop());
			videoStream = null;
		}

		if (client) {
			client.disconnect();
			client = null;
		}

		clearFeedback();
	}

	onMount(() => {
		config = get(sessionConfig);
		apiKey = get(geminiApiKey);
		if (!config) {
			goto("/lab");
			return;
		}
		if (!apiKey) {
			goto("/login");
			return;
		}
		personaName = getPersonaDisplayName(config.persona);
		scenarioName = getScenarioDisplayName(config.scenario);
		personaKey = config.persona;
	});

	// Watch for videoRef to be available, then init session
	$effect(() => {
		if (config && videoRef && !isConnected && !client) {
			initSession();
		}
	});

	// Watch for mic toggle and mute/unmute audio
	$effect(() => {
		console.log(
			"Mic effect triggered, micActive:",
			micActive,
			"client:",
			!!client,
		);
		if (client) {
			client.setMicMuted(!micActive);
			console.log("Called setMicMuted with:", !micActive);
		}
	});

	onDestroy(() => {
		cleanup();
	});

	// Subscribe to feedback store
	let feedback: FeedbackMetric | null = $state(null);
	const unsubscribeFeedback = currentFeedback.subscribe((value) => {
		feedback = value;
	});

	onDestroy(() => {
		unsubscribeFeedback();
	});
</script>

{#if config}
	<!-- Loading Overlay -->
	{#if isAnalyzing}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95"
		>
			<div class="space-y-6 text-center">
				<div class="relative">
					<div
						class="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500"
					></div>
				</div>
				<div class="space-y-2">
					<h2 class="text-xl font-semibold text-white">
						Analyzing Your Session
					</h2>
					<p class="text-sm text-slate-400">
						AI is reviewing your conversation...
					</p>
				</div>
			</div>
		</div>
	{/if}

	<div class="flex h-screen flex-col overflow-hidden bg-slate-900 text-white">
		<header
			class="z-30 flex items-center justify-between bg-white px-6 py-4 shadow-sm"
		>
			<a href="/" class="inline-flex items-center">
				<Logo class="h-10 w-auto" />
			</a>
			<div class="flex items-center gap-2">
				<span
					class="h-2 w-2 rounded-full {isConnected
						? 'animate-pulse bg-red-500'
						: 'bg-slate-500'}"
				></span>
				<span
					class="text-sm font-medium uppercase tracking-wide text-slate-600"
				>
					Live Session &bull; {scenarioName}
				</span>
			</div>
			
		</header>

		<!-- Main Scene Area -->
		<div class="relative flex flex-1 items-center justify-center">
			<!-- Threlte 3D Scene Background -->
			{#if browser}
				<div class="absolute inset-0 z-[100] h-full w-full">
					<ThrelteScene persona={personaKey ?? undefined} />
				</div>
			{/if}

			<!-- Self View (User) - PiP Style in Bottom Right -->
			<div class="absolute bottom-5 right-5 z-[110]">
				<div
					class="relative overflow-hidden rounded-xl border-2 border-white/20 shadow-2xl"
				>
					<video
						bind:this={videoRef}
						class="h-[350px] w-[500px] object-cover"
						muted
						playsinline
					></video>
					<!-- Connection indicator -->
					<div class="absolute bottom-2 left-2">
						<span
							class="flex h-3 w-3 items-center justify-center rounded-full {isConnected
								? 'bg-green-500'
								: 'bg-amber-500'}"
						>
							<span
								class="h-2 w-2 rounded-full {isConnected
									? 'animate-ping bg-green-400'
									: 'bg-amber-400'}"
							></span>
						</span>
					</div>
				</div>
			</div>

			<!-- Visual Guardrail / Feedback Banner -->
			{#if feedback}
				<div
					class="animate-fade-in absolute left-1/2 top-8 z-[120] -translate-x-1/2 rounded-2xl px-6 py-3 shadow-lg backdrop-blur-md transition-all duration-500
					{feedback.severity === 'info'
						? 'border border-blue-400/30 bg-blue-500/20 text-blue-100'
						: ''}
					{feedback.severity === 'warning'
						? 'border border-amber-400/30 bg-amber-500/20 text-amber-100'
						: ''}
					{feedback.severity === 'success'
						? 'border border-emerald-400/30 bg-emerald-500/20 text-emerald-100'
						: ''}"
				>
					<div class="flex items-center gap-3">
						{#if feedback.type === "eye_contact"}
							<!-- Eye icon -->
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path
									d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
								/>
								<circle cx="12" cy="12" r="3" />
							</svg>
						{:else if feedback.type === "posture"}
							<!-- User icon -->
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path
									d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
								/>
								<circle cx="12" cy="7" r="4" />
							</svg>
						{:else}
							<!-- Check icon for pacing/tone -->
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M20 6 9 17l-5-5" />
							</svg>
						{/if}
						<span class="text-sm font-medium"
							>{feedback.message}</span
						>
					</div>
				</div>
			{/if}
		</div>

		<!-- Persona Overlay -->
		<div class="z-10 flex flex-col bg-mblue items-center py-4 text-center">
			<h2 class="mb-1 text-xl font-light tracking-tight">
				{personaName}
				{#if config.persona === "discord_kitten"}
					<span>&#128572;</span>
				{/if}
			</h2>
			<p class="text-sm text-white">
				{isConnected ? "Listening & Analyzing..." : "Connecting..."}
			</p>
		</div>

		<!-- HUD Overlay (Wingman/Panic Button) -->
		<MoodOverlay
			{showSpacebarHint}
			{wingmanLoading}
			{showWingmanModal}
			{wingmanOptions}
			{toastMessage}
			{selectWingmanOption}
			{dismissWingman}
		/>

		<!-- Subtitles Overlay -->
		<SubtitlesOverlay show={showSubtitles} />

		<!-- Controls Bar -->
		<SessionControls
			bind:micActive
			{isConnected}
			onEndSession={handleEndSession}
		/>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center bg-slate-900">
		<div class="text-center text-white">
			<p class="text-slate-400">Initializing session...</p>
		</div>
	</div>
{/if}
