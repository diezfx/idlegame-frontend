<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import ItemView from '$lib/widgets/item.svelte';
	import { Gift } from 'lucide-svelte';

	import { DateTime } from 'luxon';
	import { JobSubType } from '../../gen/v1/masterdata_pb';
	import { jobStatusText } from '$lib/utils/enumtext';
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
	const monsters = $derived(
		(job?.monsters ?? [])
			.map((id) => gameStateStore.Monsters.get(id))
			.filter((m): m is NonNullable<typeof m> => m != null),
	);
	const mon = $derived(monsters.at(0))!;
	const inv = $derived(gameStateStore.Inventories.get(jobID));
	const subtype = $derived(job?.def?.subType ?? JobSubType.UNSPECIFIED);

	const statusColor = $derived(
		job?.jobState?.status === 1
			? 'text-yellow-600 bg-yellow-100' // In Progress (assuming 1)
			: job?.jobState?.status === 2
				? 'text-green-600 bg-green-100' // Completed (assuming 2)
				: 'text-gray-600 bg-gray-100',
	);

	function handleStopClick(event: MouseEvent): void {
		event.stopPropagation();
		onStop?.();
	}
</script>

{#if job}
	<Card {onclick} {...props} class="w-[350px]">
		<!-- Header -->
		<div class="p-4 border-b border-gray-100 grid grid-cols-[1fr_auto] items-center bg-gray-50/50 rounded-t-xl">
			<div class="flex flex-col">
				<div class="flex items-center gap-2">
					<h3 class="font-bold text-gray-800 leading-tight">{job.def?.jobDefId}</h3>
				</div>
				<span class="mt-1 text-xs text-gray-500 capitalize">{JobSubType[job.def?.subType!]}</span>
			</div>
			{#if job?.jobState?.status}
				<span class="text-xs font-semibold px-2.5 py-1 rounded-full {statusColor} capitalize">
					{jobStatusText(job.jobState.status)}
				</span>
			{/if}
		</div>

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
					value={inv?.used ?? 0}
					max={inv?.capacity ?? 100}
				></Progress>
				<div class="grid grid-cols-3 gap-1 mt-2">
					{#each inv!.items! as item (item.id)}
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
