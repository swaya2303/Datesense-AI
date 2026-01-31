<script lang="ts">
	export let label: string;
	export let value: string;
</script>

<div class="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
	<span class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</span>
	<span class="text-sm font-semibold text-slate-800">{value}</span>
</div>
