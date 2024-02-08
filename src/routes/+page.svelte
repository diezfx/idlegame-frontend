<script>
	import { onMount } from 'svelte';
	// typescript:
	// import type MyCanvasComponent from '$lib/MyCanvas.svelte';

	let MyCanvas;
	// typescript:
	// let MyCanvas: typeof MyCanvasComponent;

	onMount(async () => {
		// Dynamically import your canvas component encapsulating all svelte-konva functionality inside onMount()
		MyCanvas = (await import('$lib/MyCanvas.svelte')).default;
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<svelte:component this={MyCanvas} someProp="SomeString" />
