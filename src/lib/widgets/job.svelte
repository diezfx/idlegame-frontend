<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import type { Job } from '$lib/service/jobs';
	let { job, onclick, onStop, ...props }: { job: Job; onclick?: () => void; onStop?: () => void; [key: string]: any } =
		$props();

	import { DateTime } from 'luxon';

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

<Card.Root
	{...props}
	class="w-[350px] shadow-lg rounded-xl border border-gray-200 bg-white hover:shadow-2xl transition-shadow duration-200"
>
	<Card.Header class="flex items-center gap-2 bg-gray-50 rounded-t-xl p-4">
		<Card.Title class="text-lg font-bold">{job.jobDefId}</Card.Title>
		<span class="ml-auto text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 capitalize">
			{job.jobType}
		</span>
	</Card.Header>
	<Card.Content class="grid grid-cols-2 gap-y-1 px-4 py-2">
		<p class="font-semibold text-gray-500">Monster</p>
		<p class="truncate">{job.monsterIds?.join?.(', ') ?? job.monsterIds}</p>
		<p class="font-semibold text-gray-500">Updated</p>
		<p>{timeAgo(DateTime.fromISO(job.updatedAt))}</p>
		<p class="font-semibold text-gray-500">Started</p>
		<p>{timeAgo(DateTime.fromISO(job.startedAt))}</p>

		<p class="col-span-2 font-semibold text-gray-500 mt-2">Rewards</p>
		<div class="col-span-2 flex flex-wrap gap-2">
			{#each job.rewards as reward}
				<span class="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-medium">
					{reward.quantity} × {reward.itemDefId}
				</span>
			{/each}
		</div>
	</Card.Content>

	<Card.Footer class="justify-center p-4 bg-gray-50 rounded-b-xl">
		<Button class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded" onclick={onStop}>STOP</Button>
	</Card.Footer>
</Card.Root>
