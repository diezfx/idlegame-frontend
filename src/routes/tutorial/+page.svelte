<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { createClients } from '$lib/service/connect';
	import MasterdataMonster from '$lib/widgets/masterdata_monster.svelte';
	import type { PageProps } from './$types';
	import { getUserFromContext } from '$lib/stores/user';
	let { data }: PageProps = $props();

	const selectedColor = 'bg-green-200';

	const user = getUserFromContext()!;

	let selectedMonster: number | undefined = $state(undefined);

	const starterMons = data.monsters.filter((m) => data.starterMonsters.includes(m.id));
	const tutorialClient = createClients().tutorialClient;

	async function chooseStarter(): Promise<void> {
		const result = await tutorialClient.chooseStarter({
			id: BigInt(user.userId),
			monDefinitionId: BigInt(selectedMonster!),
		});
		console.log('chooseStarter', result);
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
