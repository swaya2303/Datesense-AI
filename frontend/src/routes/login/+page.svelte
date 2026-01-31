<script lang="ts">
	import { goto } from "$app/navigation";
	import Logo from "$lib/components/Logo.svelte";
	import { geminiApiKey } from "$lib/stores/apiKey";

	let email = $state("");
	let password = $state("");
	let geminiKey = $state("");
	let error = $state("");
	let loading = $state(false);

	const handleSubmit = async () => {
		if (!email || !password || !geminiKey) return;
		loading = true;
		error = "";
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				error = data.error || "Login failed.";
			} else {
				geminiApiKey.set(geminiKey);
				goto("/dashboard");
			}
		} catch {
			error = "Login failed.";
		} finally {
			loading = false;
		}
	};
</script>

<div class="animate-slide-in flex min-h-screen flex-col bg-slate-50">
	<header class="w-full bg-white px-6 py-4 shadow-sm">
		<a href="/" class="inline-flex items-center">
			<Logo class="h-10 w-auto" />
		</a>
	</header>

	<div class="flex flex-1 items-center justify-center p-6">
		<div
			class="border-4 border-mblue w-full max-w-2xl rounded-3xl bg-white p-10 shadow-xl"
		>
			<h1 class="text-3xl font-semibold text-slate-800">Log in</h1>
			<p class="mt-2 text-slate-600">
				Welcome back. Continue your session.
			</p>

			<form
				class="mt-8 space-y-4"
				onsubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
			>
				<input
					class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-mblue focus:ring-mblue"
					type="email"
					placeholder="Email"
					bind:value={email}
				/>
				<input
					class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-mblue focus:ring-mblue"
					type="password"
					placeholder="Password"
					bind:value={password}
				/>

				<div class="space-y-2">
					<input
						class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-mblue focus:ring-mblue"
						type="password"
						placeholder="Gemini API Key"
						bind:value={geminiKey}
					/>
					<p class="text-sm text-slate-500">
						Get your API key from <a href="https://aistudio.google.com/apikey" target="_blank" class="text-mblue hover:underline">Google AI Studio</a>
					</p>
				</div>

				{#if error}
					<p
						class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
					>
						{error}
					</p>
				{/if}

				<div
					class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center"
				>
					<button
						class="text-2xl text-center font-medium w-full sm:w-72 p-3 drop-shadow-xl rounded-full bg-lblue transition-all hover:bg-mblue disabled:cursor-not-allowed disabled:opacity-50"
						type="submit"
						disabled={loading}
					>
						{loading ? "Signing in..." : "Log in"}
					</button>
				</div>
			</form>

			<p class="mt-6 text-center text-slate-600">
				Don't have an account? <a
					href="/signup"
					class="font-semibold text-mblue hover:underline">Sign up</a
				>
			</p>
		</div>
	</div>
</div>
