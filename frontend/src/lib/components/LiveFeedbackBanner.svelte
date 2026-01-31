<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let message: string;
	export let variant: 'reminder' | 'warning' | 'success' | 'info' = 'reminder';
	export let icon: string | null = null;

	const dispatch = createEventDispatcher<{ dismiss: void }>();

	let visible = true;

	const variantMap = {
		reminder: {
			bg: 'bg-violet-50',
			border: 'border-violet-200',
			text: 'text-violet-900',
			icon: 'text-violet-500',
			svg: 'M12 6.5a1 1 0 0 1 1 1V11h3a1 1 0 0 1 0 2h-3v3a1 1 0 1 1-2 0v-3H8a1 1 0 1 1 0-2h3V7.5a1 1 0 0 1 1-1Z'
		},
		warning: {
			bg: 'bg-amber-50',
			border: 'border-amber-200',
			text: 'text-amber-900',
			icon: 'text-amber-500',
			svg: 'M11.1 4.12a1 1 0 0 1 1.8 0l7.15 14.3A1 1 0 0 1 19.15 20H4.85a1 1 0 0 1-.9-1.48l7.15-14.3ZM12 8.25a.9.9 0 0 0-.9.9v4.2a.9.9 0 1 0 1.8 0v-4.2a.9.9 0 0 0-.9-.9Zm0 7.1a1.05 1.05 0 1 0 0 2.1 1.05 1.05 0 0 0 0-2.1Z'
		},
		success: {
			bg: 'bg-emerald-50',
			border: 'border-emerald-200',
			text: 'text-emerald-900',
			icon: 'text-emerald-500',
			svg: 'M8.7 12.4a1 1 0 0 1 1.4 0l1.1 1.1 3.6-4.1a1 1 0 1 1 1.5 1.3l-4.3 4.9a1 1 0 0 1-1.5 0l-1.8-1.8a1 1 0 0 1 0-1.4Z'
		},
		info: {
			bg: 'bg-sky-50',
			border: 'border-sky-200',
			text: 'text-sky-900',
			icon: 'text-sky-500',
			svg: 'M12 7.1a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Zm.9 3.4a.9.9 0 1 0-1.8 0v5.2a.9.9 0 1 0 1.8 0v-5.2Z'
		}
	};

	const iconLabelMap = {
		reminder: 'Reminder',
		warning: 'Warning',
		success: 'Success',
		info: 'Info'
	};

	const iconMap = {
		reminder: variantMap.reminder.svg,
		warning: variantMap.warning.svg,
		success: variantMap.success.svg,
		info: variantMap.info.svg
	};

	$: styles = variantMap[variant] ?? variantMap.reminder;
	$: iconLabel = iconLabelMap[variant] ?? iconLabelMap.reminder;
	$: iconPath = icon ?? iconMap[variant] ?? iconMap.reminder;

	const dismiss = () => {
		visible = false;
		dispatch('dismiss');
	};
</script>

{#if visible}
	<div
		class={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-sm ${styles.bg} ${styles.border} ${styles.text}`}
		role="status"
		aria-live="polite"
	>
		<div class={`flex h-9 w-9 items-center justify-center rounded-full bg-white/70 ${styles.icon}`}>
			<svg
				viewBox="0 0 24 24"
				class="h-5 w-5"
				fill="currentColor"
				aria-hidden="true"
			>
				<path d={iconPath} />
			</svg>
			<span class="sr-only">{iconLabel} icon</span>
		</div>
		<div class="flex-1">
			<p class="text-sm leading-relaxed">{message}</p>
		</div>
		<button
			type="button"
			class="rounded-full px-2 py-1 text-xs font-medium transition hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
			aria-label="Dismiss feedback"
			on:click={dismiss}
		>
			Dismiss
		</button>
	</div>
{/if}
