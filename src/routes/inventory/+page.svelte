<script lang="ts">
	import { EntityType } from '$gen/v1/domain_pb';
	import type { InventoryView } from '$gen/v1/views_pb';
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
			.filter((x) => x.entity?.entity?.entityType == EntityType.PLAYER_LOCATION)
			.toArray(),
	);

	type InventoryRow = {
		id: string;
		quantity: bigint;
		importQuantity: bigint;
		exportQuantity: bigint;
	};

	const getFullInv = (inv: InventoryView): Map<string, InventoryRow> => {
		const rows = new Map<string, InventoryRow>();

		const defaultEntry = (id: string): InventoryRow => ({
			id,
			quantity: 0n,
			exportQuantity: 0n,
			importQuantity: 0n,
		});
		for (const item of inv.entity?.inventory?.items ?? []) {
			const row = rows.getOrInsert(item.id, defaultEntry(item.id));
			row.quantity += item.quantity;
		}
		for (const item of inv.entity?.importRequest?.items ?? []) {
			const row = rows.getOrInsert(item.id, defaultEntry(item.id));
			row.importQuantity += item.quantity;
		}
		for (const item of inv.entity?.exportRequest?.items ?? []) {
			const row = rows.getOrInsert(item.id, defaultEntry(item.id));
			row.exportQuantity += item.quantity;
		}

		return rows;
	};
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
					<span>{inv.entity?.identity?.name}</span>
					<span class="text-right text-xs font-normal tabular-nums">
						<span class="block">{inv.used} / {inv.entity?.inventory?.capacity ?? 0} used</span>
						<span class="text-muted-foreground block">
							{Math.max((inv.entity?.inventory?.capacity ?? 0) - inv.used, 0)} free
						</span>
					</span>
				</div>
			{/snippet}
			<Progress
				value={inv.used}
				max={inv.entity?.inventory?.capacity}
				class="mx-3 my-2 h-1 w-auto"
				foreground="bg-primary/70"
				background="bg-accent/30"
			></Progress>
			<Table class="w-full">
				<TableHeader class="bg-accent/20">
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead class="text-right">Quantity</TableHead>
						<TableHead class="text-right">Import</TableHead>
						<TableHead class="text-right">Export</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{#each getFullInv(inv)! as [_, row]}
						<TableRow>
							<TableCell>{row.id}</TableCell>
							<TableCell class="text-right tabular-nums">{row.quantity}</TableCell>
							<TableCell class="text-right tabular-nums">{row.importQuantity}</TableCell>
							<TableCell class="text-right tabular-nums">{row.exportQuantity}</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</Collapsible>
	{/each}
</div>
