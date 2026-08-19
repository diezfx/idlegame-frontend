<script lang="ts">
	import { EntityType } from '$gen/v1/domain_pb';
	import Collapsible from '$lib/components/ui/collapsible/collapsible.svelte';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import Table from '$lib/components/ui/table/Table.svelte';
	import TableBody from '$lib/components/ui/table/TableBody.svelte';
	import TableCell from '$lib/components/ui/table/TableCell.svelte';
	import TableHead from '$lib/components/ui/table/TableHead.svelte';
	import TableHeader from '$lib/components/ui/table/TableHeader.svelte';
	import TableRow from '$lib/components/ui/table/TableRow.svelte';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';

	const allInvs = $derived(gameStateStore.Inventories);
	const invs = $derived(
		allInvs
			.values()
			.filter((x) => x.entity?.entityType == EntityType.PLAYER_LOCATION)
			.toArray(),
	);
</script>

<h1>Inventory</h1>
<div class="gap-3">
	{#each invs as inv}
		<Collapsible
			open={true}
			class="mb-4 overflow-hidden rounded-md border border-border bg-card"
			buttonStyle={false}
			buttonClass="flex w-full rounded-none bg-accent/40 px-3 py-2 text-accent-foreground hover:bg-accent/60"
		>
			{#snippet title()}
				<div class="flex w-full items-center justify-between gap-3">
					<span>{inv.identity?.name}</span>
					<span class="text-right text-xs font-normal tabular-nums">
						<span class="block">{inv.used} / {inv.inventory?.capacity ?? 0} used</span>
						<span class="text-muted-foreground block">
							{Math.max((inv.inventory?.capacity ?? 0) - inv.used, 0)} free
						</span>
					</span>
				</div>
			{/snippet}
			<Progress
				value={inv.used}
				max={inv.inventory?.capacity}
				class="mx-3 my-2 h-1 w-auto"
				foreground="bg-primary/70"
				background="bg-accent/30"
			></Progress>
			<Table class="w-full">
				<TableHeader class="bg-accent/20">
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead class="text-right">Quantity</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{#each inv.inventory!.items! as item (item.id)}
						<TableRow>
							<TableCell>{item.id}</TableCell>
							<TableCell class="text-right tabular-nums">{item.quantity}</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</Collapsible>
	{/each}
</div>
