<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';

	let isLoggingOut = $state(false);

	const handleLogout = async () => {
		if (isLoggingOut) return;
		isLoggingOut = true;
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			await invalidateAll();
		} finally {
			goto('/');
		}
	};
</script>

<div class="flex min-h-screen flex-col bg-slate-50">
	<header class="w-full bg-white px-6 py-4 shadow-sm">
		<div class="flex items-center justify-between">
			<a href="/" class="inline-flex items-center">
				<Logo class="h-10 w-auto" />
			</a>
			<button
				onclick={handleLogout}
				disabled={isLoggingOut}
				class="text-lg font-medium text-slate-600 transition-colors hover:text-slate-900 disabled:opacity-60"
			>
				{isLoggingOut ? 'Logging out...' : 'Log out'}
			</button>
		</div>
	</header>

	<div class="animate-slide-in flex flex-1 flex-col items-center justify-center gap-10 px-6">
		<h1 class="text-5xl font-semibold text-slate-800 text-center">Welcome to DateSense AI</h1>
		<div class="flex flex-col gap-4 sm:flex-row">
			<button
				class="text-2xl text-center font-medium w-48 md:w-70 p-3 drop-shadow-xl rounded-full bg-lblue"
				onclick={() => goto('/lab')}
			>
				Rizz
			</button>
			<button
				class="text-2xl text-center font-medium w-48 md:w-70 p-3 drop-shadow-xl rounded-full bg-lblue"
				onclick={() => goto('/textMentor')}
			>
				Reword
			</button>
		</div>
	</div>
</div>
