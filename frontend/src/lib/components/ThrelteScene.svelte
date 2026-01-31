<script lang="ts">
	import { Canvas, T } from '@threlte/core';
	import type { PerspectiveCamera } from 'three';
	import type { Persona } from '$lib/types';
	import FloatingCylinder from '$lib/components/FloatingCylinder.svelte';

	let { persona = null }: { persona?: Persona | null } = $props();
</script>

<div class="threlte-container">
	<Canvas colorManagementEnabled={false} toneMapping={0}>
		<T.PerspectiveCamera
			makeDefault
			position={[0, 0, 5]}
			fov={50}
			oncreate={(ref: PerspectiveCamera) => {
				ref.lookAt(0, 0, 0);
			}}
		/>

		<T.DirectionalLight position={[4, 6, 6]} intensity={0.9} />
		<T.AmbientLight intensity={0.7} />

		<FloatingCylinder persona={persona ?? undefined} />
	</Canvas>
</div>

<style>
	.threlte-container {
		width: 100%;
		height: 100%;
		min-height: 100%;
		background: #83C3CE;
	}

	.threlte-container :global(canvas) {
		display: block;
		width: 100% !important;
		height: 100% !important;
	}
</style>
