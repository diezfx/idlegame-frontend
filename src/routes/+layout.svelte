<script>
	import Nav from '$lib/widgets/nav.svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';

	onMount(() => {
		gameStateStore.initialize().catch((error) => {
			console.error('Failed to initialize game state', error);
		});
	});

	console.log('Layout loaded');
	let { children } = $props();
</script>

<div class="flex min-h-screen bg-background">
	<Nav />
	<main class="flex-1 p-2">
		{@render children()}
	</main>
</div>
