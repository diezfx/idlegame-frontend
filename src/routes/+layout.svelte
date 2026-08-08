<script>
	import Nav from '$lib/widgets/nav.svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import { clients } from '$lib/service/connect';
	import { userStore } from '$lib/stores/user.svelte';
	import { JobService } from '$lib/service/jobs';
	import { BattleService } from '$lib/service/battles';
	import { InventoryService } from '$lib/service/inventory';
	import { TutorialService } from '$lib/service/tutorial';
	import { setServicesContext } from '$lib/service/context';

	setServicesContext({
		jobs: new JobService(clients.jobClient, gameStateStore, userStore),
		battles: new BattleService(clients.jobClient, gameStateStore, userStore),
		inventory: new InventoryService(clients.inventoryClient, gameStateStore, userStore),
		tutorial: new TutorialService(clients.tutorialClient, gameStateStore, userStore),
	});

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
