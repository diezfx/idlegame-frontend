<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import type { Monster } from '$lib/service/monsters';
	import MonsterView from '$lib/widgets/monster.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import log from '$lib/log/log';

	let { data } = $props();

	let openDialog = $state(false);

	// make a call to api to equip item
	function dialogClicked(m: Monster): void {
		openDialog = false;
	}
</script>

<h1>Monsters</h1>
<div class="grid grid-cols-3 gap-4">
	{#each data.monsters as monster}
		<div>
			<MonsterView {monster} />
			<Card
				onclick={() => {
					openDialog = true;
				}}
				class="button text-center text-green-500 text-2xl"
				>+
			</Card>
		</div>
	{/each}
</div>

<Dialog.Root open={openDialog} onOpenChange={() => (openDialog = false)}>
	<Dialog.Trigger>Open</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Chose Item to Equip</Dialog.Title>
		</Dialog.Header>

		{#each data.inventory.items as item}
			<p>{item.id}</p>
		{/each}
	</Dialog.Content>
</Dialog.Root>
