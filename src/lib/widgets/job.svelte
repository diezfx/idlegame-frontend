<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import ItemView from '$lib/widgets/item.svelte';

	import { DateTime } from 'luxon';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	let {
		jobID,
		onclick,
		onStop,
		...props
	}: {
		jobID: string;
		onclick?: () => void;
		onStop?: () => void;
		[key: string]: any;
	} = $props();

	const units: Intl.RelativeTimeFormatUnit[] = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];

	export const timeAgo = (dateTime: DateTime) => {
		const diff = dateTime.diffNow().shiftTo(...units);
		const unit = units.find((unit) => diff.get(unit) !== 0) || 'second';

		const relativeFormatter = new Intl.RelativeTimeFormat('en', {
			numeric: 'auto',
		});
		return relativeFormatter.format(Math.trunc(diff.as(unit)), unit);
	};

	const job = $derived(gameStateStore.Jobs.get(jobID));
	const inv = $derived(await gameStateStore.getInventory(jobID));
	const monsters = $derived(
		(job?.monsters ?? [])
			.map((id) => gameStateStore.Monsters.get(id))
			.filter((m): m is NonNullable<typeof m> => m != null),
	);
	const mon = $derived(monsters.at(0))!;

	function handleStopClick(event: MouseEvent): void {
		event.stopPropagation();
		onStop?.();
	}
</script>

{#if job}
	<Card {onclick} title={job.def?.jobDefId} class="w-[350px]">
		<div class="p-4 space-y-4">
			<h3>Monsters</h3>
			<Card class="gap-2 p-2" title={mon.identity?.name}>
				<span>Stamina</span>
				<Progress
					showLabel={true}
					foreground="bg-yellow-200"
					background="bg-yellow-200/30"
					value={mon.stat?.stamina ?? 0}
					max={mon.stat?.maxStamina ?? 100}
				/>
			</Card>
			<h3>Inventory</h3>
			<Card class="gap-1 p-1">
				<Progress
					class="p-2"
					showLabel={true}
					foreground="bg-cyan-200"
					background="bg-cyan-200/50"
					value={inv.used ?? 0}
					max={inv?.inventory?.capacity ?? 100}
				></Progress>
				<div class="grid grid-cols-3 gap-1 mt-2">
					{#each inv!.inventory!.items! as item (item.id)}
						<ItemView {item} class="scale bg-secondary text-secondary-foreground" />
					{/each}
				</div>
			</Card>
		</div>

		<!-- Action Footer -->
		<div class="p-4 bg-gray-50/50 border-t border-gray-100 rounded-b-xl flex justify-center">
			<Button
				class="w-full bg-destructive hover:bg-destructive/90 text-white font-medium shadow-sm hover:shadow transition-all"
				onclick={handleStopClick}
			>
				Stop Job
			</Button>
		</div>
	</Card>
{/if}
