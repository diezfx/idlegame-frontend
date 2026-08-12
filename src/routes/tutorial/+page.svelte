<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import MasterdataMonster from '$lib/widgets/masterdata_monster.svelte';
	import type { PageProps } from './$types';
	import { getServicesContext } from '$lib/service/context';
	import { goto } from '$app/navigation';
	let { data }: PageProps = $props();
	const { tutorial: tutorialService } = getServicesContext();

	const selectedColor = 'bg-primary/20';

	let selectedMonster: number | undefined = $state(undefined);

	const starterMons = $derived(data.monsters.filter((m) => data.starterMonsters.includes(m.id)));
	async function chooseStarter(): Promise<void> {
		await tutorialService.chooseStarter(selectedMonster!);
		await goto('/monsters');
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
