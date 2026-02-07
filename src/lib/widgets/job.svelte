<script lang="ts">
	import { JobSubType } from '$gen/v1/masterdata_pb';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import { protoToMilliseconds } from '$lib/utils/prototime';
	import { CircleAlert, CirclePlay, Gift } from 'lucide-svelte';
	import { DateTime } from 'luxon';
	let{
		jobID,
		onStop,
		...props	
	}: {
		jobID: string;
		onclick?: () => void;
		onStop?: () => void;
		[key: string]: any;
	} = $props();

	const gs = gameStateStore;
	const job = $derived(await gs.getJob(jobID));


	const units: Intl.RelativeTimeFormatUnit[] = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];

	export const timeAgo = (dateTime: DateTime) => {
		const diff = dateTime.diffNow().shiftTo(...units);
		const unit = units.find((unit) => diff.get(unit) !== 0) || 'second';

		const relativeFormatter = new Intl.RelativeTimeFormat('en', {
			numeric: 'auto',
		});
		return relativeFormatter.format(Math.trunc(diff.as(unit)), unit);
	};

</script>

<Card

>
	<!-- Header -->
	<div class="p-4 border-b border-gray-100 grid grid-cols-[1fr_auto] items-center bg-gray-50/50 rounded-t-xl">
		<div class="flex flex-col">
			<h3 class="font-bold text-gray-800 leading-tight">{job!.def?.jobDefId}</h3>

	<div class="p-4 space-y-4">
		<!-- Monster Info -->
		<div class="grid grid-cols-[auto_1fr] gap-3 items-start">
			<div class="mt-0.5 text-gray-400">
	class="w-[350px] shadow-lg rounded-xl border border-gray-200 bg-white hover:shadow-2xl transition-shadow duration-200"
			<div class="flex flex-col flex-1 min-w-0">
	{#snippet title()}
		<div class="flex items-center gap-2 bg-gray-50 rounded-t-xl p-4">
			<div class="text-lg font-bold">{job!.def?.jobDefId}</div>
			<span class="ml-auto text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 capitalize">
				{JobSubType[job!.def?.subType!]}
					<CirclePlay size={16} />
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
