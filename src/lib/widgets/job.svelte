<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Job } from '$lib/service/jobs';
	let { job }: { job: Job } = $props();

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

<Card.Root class="w-[350px]">
	<Card.Header>
		<Card.Title>Card Title</Card.Title>
		<Card.Description>Card Description</Card.Description>
	</Card.Header>
	<Card.Content>
		<p>{job.monsterIds}</p>
		<p>{timeAgo(DateTime.fromISO(job.updatedAt))}</p>
		<p>{timeAgo(DateTime.fromISO(job.startedAt))}</p>

		<p>Card Content</p>
	</Card.Content>
	<Card.Footer>
		<p>Card Footer</p>
	</Card.Footer>
</Card.Root>
