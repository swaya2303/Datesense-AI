<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Decal, interactivity } from '@threlte/extras';
	import * as THREE from 'three';
	import type { Mesh } from 'three';
	import type { Persona } from '$lib/types';

	// Enable interactivity for pointer events
	interactivity();

	let { persona = null }: { persona?: Persona | null } = $props();

	let cylinderRef: Mesh | null = $state(null);
	let isHovered = $state(false);

	const floatBaseY = 0;
	const floatAmplitude = 0.11;
	const floatSpeed = 0.5;
	const tiltAmplitude = 0.12;
	const tiltSpeed = 0.6;
	let elapsed = 0;

	// Load textures using THREE.TextureLoader
	const textureLoader = new THREE.TextureLoader();
	const textures: Record<string, THREE.Texture> = {
		male: textureLoader.load('/alex.png'),
		female: textureLoader.load('/SarahTheSquare.png'),
		discord_kitten: textureLoader.load('/discordKitten.png')
	};

	useTask((delta) => {
		if (!cylinderRef) return;
		elapsed += delta;

		if (isHovered) {
			// Wiggle animation - faster, smaller movements
			cylinderRef.position.y = 0;
			cylinderRef.rotation.z = Math.sin(elapsed * 5) * 0.08;
			cylinderRef.rotation.x = Math.PI / 2 + Math.sin(elapsed * 7) * 0.05;
		} else {
			// Normal float/tilt animation
			cylinderRef.position.y = floatBaseY + Math.sin(elapsed * floatSpeed) * floatAmplitude;
			cylinderRef.rotation.z = Math.sin(elapsed * tiltSpeed) * tiltAmplitude;
			cylinderRef.rotation.x = Math.PI / 2;
		}
	});

</script>

<T.Mesh
	rotation.x={Math.PI / 2}
	oncreate={(ref: Mesh) => {
		cylinderRef = ref;
	}}
	onpointerenter={() => isHovered = true}
	onpointerleave={() => isHovered = false}
>
	<T.CylinderGeometry args={[1.2, 0.5, 1, 48]} />
	<T.MeshStandardMaterial color="#9eebf7" roughness={0.6} metalness={0.1} />

	{#if persona && textures[persona]}
		<Decal
			position={[0, 1, 0]}
			rotation={[Math.PI/2, 0, -Math.PI]}
			scale={1.5}
		>
			<T.MeshBasicMaterial
				map={textures[persona]}
				polygonOffset
				polygonOffsetFactor={-10}
				transparent
			/>
		</Decal>
	{/if}
</T.Mesh>
