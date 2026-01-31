<script lang="ts">
	let { size = 36, stroke = 'black' }: { size?: number; stroke?: string } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path d="M7.39584 17.75H28.1042" {stroke} stroke-width="2.95833" stroke-linecap="round" stroke-linejoin="round"/>
	<path d="M17.75 7.39584L28.1042 17.75L17.75 28.1042" {stroke} stroke-width="2.95833" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
