<script lang="ts">
	import { JobSubType } from '$gen/v1/masterdata_pb';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { CalendarClock, Skull, Gift, CirclePlay, CircleAlert } from 'lucide-svelte';

	import { DateTime } from 'luxon';
	import { protoToMilliseconds } from '$lib/utils/prototime';
	import { JobSubType } from '../../gen/v1/masterdata_pb';
	import { jobStatusText } from '$lib/utils/enumtext';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
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

	const job = $derived(await gameStateStore.getJob(jobID));
	const monsters = $derived(await Promise.all(job!.monsters.map((id) => gameStateStore.getMonster(id))));

	const statusColor = $derived(
		job?.jobState?.status === 1
			? 'text-yellow-600 bg-yellow-100' // In Progress (assuming 1)
			: job?.jobState?.status === 2
				? 'text-green-600 bg-green-100' // Completed (assuming 2)
				: 'text-gray-600 bg-gray-100',
	);
</script>

<Card
	{onclick}
	{...props}
	class="w-[350px] shadow-lg rounded-xl border border-gray-200 bg-white hover:shadow-2xl transition-shadow duration-200 {props.class ||
		''}"
>
	<!-- Header -->
	<div class="p-4 border-b border-gray-100 grid grid-cols-[1fr_auto] items-center bg-gray-50/50 rounded-t-xl">
		<div class="flex flex-col">
			<h3 class="font-bold text-gray-800 leading-tight">{job!.def?.jobDefId}</h3>
			<span class="text-xs text-gray-500 capitalize">{JobSubType[job!.def?.subType!]}</span>
		</div>
		{#if job?.jobState?.status}
			<span class="text-xs font-semibold px-2.5 py-1 rounded-full {statusColor} capitalize">
				{jobStatusText(job.jobState.status)}
			</span>
		{/if}
	</div>

	<div class="p-4 space-y-4">
		<!-- Monster Info -->
		<div class="grid grid-cols-[auto_1fr] gap-3 items-start">
			<div class="mt-0.5 text-gray-400">
				<Skull size={16} />
			</div>
			<div class="flex flex-col flex-1 min-w-0">
				<span class="text-xs text-gray-500 uppercase font-semibold tracking-wider">Assigned Monster</span>
				<span class="font-medium text-gray-900 truncate">{monsters.map((m) => m!.identity?.name).join?.(', ')}</span>
			</div>
		</div>

		<!-- Timestamps Grid -->
		<div class="grid grid-cols-2 gap-4">
			<div class="grid grid-cols-[auto_1fr] gap-2 items-start">
				<div class="mt-0.5 text-gray-400">
					<CirclePlay size={16} />
				</div>
				<div class="flex flex-col">
					<span class="text-xs text-gray-500 uppercase font-semibold tracking-wider">Started</span>
					<span class="text-sm text-gray-900"
						>{timeAgo(DateTime.fromMillis(protoToMilliseconds(job.entity?.createdAt!)))}</span
					>
				</div>
			</div>

			<div class="grid grid-cols-[auto_1fr] gap-2 items-start">
				<div class="mt-0.5 text-gray-400">
					<CalendarClock size={16} />
				</div>
				<div class="flex flex-col">
					<span class="text-xs text-gray-500 uppercase font-semibold tracking-wider">Updated</span>
					<span class="text-sm text-gray-900"
						>{timeAgo(DateTime.fromMillis(protoToMilliseconds(job.jobState?.updatedAt!)))}</span
					>
				</div>
			</div>
		</div>

		<!-- Rewards -->
		{#if job.rewards?.inventory?.items?.length}
			<Separator class="bg-gray-100" />
			<div>
				<div class="grid grid-flow-col justify-start items-center gap-1.5 text-xs text-gray-500 mb-2 font-medium">
					<Gift size={14} /> Rewards
				</div>
				<div class="flex flex-wrap gap-2">
					{#each job.rewards.inventory.items as reward}
						<span
							class="inline-flex items-center px-2 py-1 bg-green-50 border border-green-100 rounded-md text-green-700 text-xs font-medium"
						>
							{reward.quantity} × {reward.id}
						</span>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Action Footer -->
	<div class="p-4 bg-gray-50/50 border-t border-gray-100 rounded-b-xl flex justify-center">
		<Button
			class="w-full bg-red-500 hover:bg-red-600 text-white font-medium shadow-sm hover:shadow transition-all"
			onclick={onStop}
		>
			<CircleAlert size={16} class="mr-2" /> Stop Job
		</Button>
	</div>
</Card>
