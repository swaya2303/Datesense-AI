<script lang="ts">
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	const handleSubmit = async () => {
		if (!email || !password) return;
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				error = data.error || 'Signup failed.';
			} else {
				goto('/dashboard');
			}
		} catch {
			error = 'Signup failed.';
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
		<div class="border-4 border-mblue w-full max-w-2xl rounded-3xl bg-white p-10 shadow-xl">
			<h1 class="text-3xl font-semibold text-slate-800">Create account</h1>
			<p class="mt-2 text-slate-600">Start your Nerurizz journey.</p>

			<div class="mt-8 space-y-4">
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
			</div>

			{#if error}
				<p class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
			{/if}

			<div class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
				<button
					class="text-2xl text-center font-medium w-70 p-3 drop-shadow-xl rounded-full bg-lblue transition-all hover:bg-mblue disabled:cursor-not-allowed disabled:opacity-50"
					onclick={handleSubmit}
					disabled={loading}
				>
					{loading ? 'Creating...' : 'Sign up'}
				</button>
			</div>

			<p class="mt-6 text-center text-slate-600">
				Already have an account? <a href="/login" class="font-semibold text-mblue hover:underline">Log in</a>
			</p>
		</div>
	</div>
</div>
