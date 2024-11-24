<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import type { Job, JobMasterdata } from '$lib/service/jobs';
	let { job, ...props }: { job: Job; [key: string]: any } = $props();

	import { DateTime } from 'luxon';

	const units: Intl.RelativeTimeFormatUnit[] = [
		'year',
		'month',
		'week',
		'day',
		'hour',
		'minute',
		'second',
	];

	export const timeAgo = (dateTime: DateTime) => {
		const diff = dateTime.diffNow().shiftTo(...units);
		const unit = units.find((unit) => diff.get(unit) !== 0) || 'second';

		const relativeFormatter = new Intl.RelativeTimeFormat('en', {
			numeric: 'auto',
		});
		return relativeFormatter.format(Math.trunc(diff.as(unit)), unit);
	};
</script>

<Card.Root {...props} class="w-[350px]">
	<Card.Header>
		<Card.Title>{job.jobDefId}</Card.Title>
	</Card.Header>
	<Card.Content class="grid grid-cols-2">
		<p>Monster</p>
		<p>{job.monsterIds}</p>
		<p>Updated</p>
		<p>{timeAgo(DateTime.fromISO(job.updatedAt))}</p>
		<p>Started</p>
		<p>{timeAgo(DateTime.fromISO(job.startedAt))}</p>

		<p class="col-span-2">Rewards</p>
		{#each job.rewards as reward}
			<p>{reward.itemDefId}</p>
			<p>{reward.quantity}</p>
		{/each}
	</Card.Content>

	<Card.Footer class="justify-center"><Button class="bg-red-500">STOP</Button></Card.Footer>
</Card.Root>
