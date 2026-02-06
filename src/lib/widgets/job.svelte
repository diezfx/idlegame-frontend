<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';

	let {
		gs,
		jobID,
		onclick,
		onStop,
		...props
	}: {
		gs: GameStateStore;
		jobID: string;
		onclick?: () => void;
		onStop?: () => void;
		[key: string]: any;
	} = $props();

	import { DateTime } from 'luxon';
	import { protoToMilliseconds } from '$lib/utils/prototime';
	import { JobSubType } from '../../gen/v1/masterdata_pb';
	import { jobStatusText } from '$lib/utils/enumtext';
	import type { GameStateStore } from '$lib/stores/gamestate.svelte';

	const units: Intl.RelativeTimeFormatUnit[] = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];

	export const timeAgo = (dateTime: DateTime) => {
		const diff = dateTime.diffNow().shiftTo(...units);
		const unit = units.find((unit) => diff.get(unit) !== 0) || 'second';

		const relativeFormatter = new Intl.RelativeTimeFormat('en', {
			numeric: 'auto',
		});
		return relativeFormatter.format(Math.trunc(diff.as(unit)), unit);
	};

	const job = $derived(await gs.getJob(jobID));
	const monsters = $derived(await Promise.all(job!.monsters.map((id) => gs.getMonster(id))));
</script>

<Card
	{onclick}
	{...props}
	class="w-[350px] shadow-lg rounded-xl border border-gray-200 bg-white hover:shadow-2xl transition-shadow duration-200"
>
	{#snippet title()}
		<div class="flex items-center gap-2 bg-gray-50 rounded-t-xl p-4">
			<div class="text-lg font-bold">{job!.def?.jobDefId}</div>
			<span class="ml-auto text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 capitalize">
				{JobSubType[job!.def?.subType!]}
			</span>
		</div>
	{/snippet}

	<div class="grid grid-cols-2 gap-y-1 px-4 py-2">
		<p class="font-semibold text-gray-500">Monster</p>
		<p class="truncate">{monsters.map((m) => m!.identity?.name).join?.(', ')}</p>
		{#if job.jobState && job.jobState.status}
			<p class="font-semibold text-gray-500">Status</p>
			<p class="capitalize">{jobStatusText(job.jobState.status)}</p>
		{/if}
		<p class="font-semibold text-gray-500">Updated</p>
		<p>{timeAgo(DateTime.fromMillis(protoToMilliseconds(job.jobState?.updatedAt!)))}</p>
		<p class="font-semibold text-gray-500">Started</p>
		<p>{timeAgo(DateTime.fromMillis(protoToMilliseconds(job.entity?.createdAt!)))}</p>

		<p class="col-span-2 font-semibold text-gray-500 mt-2">Rewards</p>
		<div class="col-span-2 flex flex-wrap gap-2">
			{#each job.rewards!.inventory!.items! as reward}
				<span class="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-medium">
					{reward.quantity} × {reward.id}
				</span>
			{/each}
		</div>
	</div>

	<div class="justify-center p-4 bg-gray-50 rounded-b-xl">
		<Button class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded" onclick={onStop}>STOP</Button>
	</div>
</Card>
