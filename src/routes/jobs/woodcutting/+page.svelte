<script lang="ts">
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import * as Card from '$lib/components/ui/card';
	import type { Job, JobsClient } from '$lib/service/jobs';
	import type { PageData } from './$types';
	import * as Dialog from '$lib/components/ui/dialog';

	let { data } = $props();

	let openDialog = $state(false);
</script>

<h1>Woodcutting</h1>

<div>Currently active Jobs</div>
<div class="grid grid-cols-3 gap-2">
	{#each data.jobs as job}
		<Card.Root>
			<Card.Header>
				<CardTitle>{job.id}</CardTitle>
			</Card.Header>
		</Card.Root>
	{/each}
	<Card.Root
		onclick={() => {
			openDialog = true;
		}}
		class="button text-center text-green-500 text-2xl hover:bg-green-300">+</Card.Root
	>
</div>

<Dialog.Root open={openDialog} onOpenChange={() => (openDialog = false)}>
	<Dialog.Trigger>Open</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. This will permanently delete your account and remove your data
				from our servers.
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>

<div class="grid grid-cols-4 gap-2">
	{#each data.masterdata as job}
		<Card.Root>
			<Card.Header>
				<Card.Title>{job.id}</Card.Title>
			</Card.Header>

			<Card.Content class="grid grid-cols-2">
				<p>Required Level</p>
				<p>{job.levelRequirement}</p>
				<div>Duration</div>
				<p>{job.duration}</p>

				<div>Experience</div>
				<p>{job.rewards.experience}</p>
			</Card.Content>
		</Card.Root>
	{/each}
</div>
