<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	let {
		job,
		onclick,
		onStop,
		...props
	}: {
		job: Job;
		onclick?: () => void;
		onStop?: () => void;
		[key: string]: any;
	} = $props();

	import { DateTime } from 'luxon';
	import type { Job } from '../../gen/v1/domain_pb';
	import { protoToMilliseconds } from '$lib/utils/prototime';

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
	class="card-root"
>
	<Card.Header class="card-header">
		<Card.Title class="card-title">{job.def?.jobDefId}</Card.Title>
		<span class="job-type">
			{job.def?.jobType}
		</span>
	</Card.Header>
	<Card.Content class="card-content">
		<p class="label">Monster</p>
		<p class="truncate">{job.monsters?.join?.(', ') ?? job.monsters}</p>
		{#if job.jobState && job.jobState.status}
			<p class="label">Status</p>
			<p class="capitalize">{job.jobState.status}</p>
		{/if}
		<p class="label">Updated</p>
		<p>{timeAgo(DateTime.fromMillis(protoToMilliseconds(job.jobState?.updatedAt!)))}</p>
		<p class="label">Started</p>
		<p>{timeAgo(DateTime.fromMillis(protoToMilliseconds(job.entity?.createdAt!)))}</p>

		<p class="rewards-label">Rewards</p>
		<div class="rewards-container">
			{#each job.rewards?.inventory?.items! as reward}
				<span class="reward-item">
					{reward.quantity} × {reward.id}
				</span>
			{/each}
		</div>
	</Card.Content>

	<Card.Footer class="card-footer">
		<Button class="stop-button" onclick={onStop}>STOP</Button>
	</Card.Footer>
</Card.Root>

<style>
	.card-root {
		width: 350px;
		box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
		border-radius: 0.75rem;
		border: 1px solid #e5e7eb;
		background-color: white;
		transition: box-shadow 0.2s;
	}
	.card-root:hover {
		box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
	}
	.card-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: #f9fafb;
		border-top-left-radius: 0.75rem;
		border-top-right-radius: 0.75rem;
		padding: 1rem;
	}
	.card-title {
		font-size: 1.125rem;
		font-weight: 700;
	}
	.job-type {
		margin-left: auto;
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		background-color: #dbeafe;
		color: #1e40af;
		text-transform: capitalize;
	}
	.card-content {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.25rem;
		padding: 0.5rem 1rem;
	}
	.label {
		font-weight: 600;
		color: #6b7280;
	}
	.truncate {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.capitalize {
		text-transform: capitalize;
	}
	.rewards-label {
		grid-column: span 2;
		font-weight: 600;
		color: #6b7280;
		margin-top: 0.5rem;
	}
	.rewards-container {
		grid-column: span 2;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.reward-item {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		background-color: #dcfce7;
		color: #166534;
		font-size: 0.75rem;
		font-weight: 500;
	}
	.card-footer {
		justify-content: center;
		padding: 1rem;
		background-color: #f9fafb;
		border-bottom-left-radius: 0.75rem;
		border-bottom-right-radius: 0.75rem;
	}
	.stop-button {
		background-color: #ef4444;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
	}
	.stop-button:hover {
		background-color: #dc2626;
	}
</style>
