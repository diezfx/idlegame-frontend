<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { clients } from '$lib/service/connect';
	import MasterdataMonster from '$lib/widgets/masterdata_monster.svelte';
	import type { PageProps } from './$types';
	import { userStore } from '$lib/stores/user.svelte';
	import { goto } from '$app/navigation';
	let { data }: PageProps = $props();

	const selectedColor = 'bg-green-200';

	const user = userStore.getUser()!;

	let selectedMonster: number | undefined = $state(undefined);

	const starterMons = data.monsters.filter((m) => data.starterMonsters.includes(m.id));
	const tutorialClient = clients.tutorialClient;

	async function chooseStarter(): Promise<void> {
		const result = await tutorialClient.chooseStarter({
			id: BigInt(user.userId),
			monDefinitionId: BigInt(selectedMonster!),
		});
		goto('/monsters');
	}
</script>

<h1>Starters</h1>
<div class="grid grid-cols-3 gap-4">
	{#each starterMons as monster}
		<MasterdataMonster
			onclick={() => (selectedMonster = monster.id)}
			class={monster.id === selectedMonster ? selectedColor : ''}
			aria-checked={monster.id === selectedMonster}
			{monster}
		></MasterdataMonster>
	{/each}
</div>
<Button disabled={selectedMonster ? false : true} onclick={chooseStarter}>Choose Monster</Button>
