<script lang="ts">
	import { onMount } from 'svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { cn } from '$lib/utils';
	import { protoToMilliseconds } from '$lib/utils/prototime';
	import { Duration } from 'luxon';
	import type { BattleJobInfo, ProductionJobInfo } from '../../gen/v1/service_pb';
	import { masterdataStore } from '$lib/stores/masterdata.svelte';
	import DescriptionList from '$lib/components/ui/descriptionlist/DescriptionList.svelte';
	import DescriptionRow from '$lib/components/ui/descriptionlist/DescriptionRow.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	type JobCardData = {
		definition?: ProductionJobInfo['definition'] | BattleJobInfo['definition'];
		routeInfo?: ProductionJobInfo['routeInfo'] | BattleJobInfo['routeInfo'];
	};

	let {
		job,
		selected = false,
		interactive = true,
		onclick,
		class: className,
	}: {
		job: JobCardData;
		selected?: boolean;
		interactive?: boolean;
		onclick?: () => void;
		class?: string;
	} = $props();

	const itemDefs = $derived(masterdataStore.Items);
	const ingredients = $derived.by(() => {
		const definition = job.definition as { ingredients?: { id: string; quantity: bigint }[] } | undefined;
		return definition?.ingredients ?? [];
	});

	onMount(() => {
		if (masterdataStore.Items.size === 0) {
			void masterdataStore.getItems();
		}
	});

	function rewardLabel(id: string): string {
		return itemDefs.get(id)?.name ?? id;
	}
</script>

<Card
	title={job.definition?.name ?? job.definition?.id}
	{onclick}
	class={cn('w-full border', interactive ? 'cursor-pointer' : '', selected && 'bg-accent', className)}
>
	<DescriptionList>
		<DescriptionRow term="Required Lvl">{job.definition?.levelRequirement}</DescriptionRow>
		<DescriptionRow term="Stamina Cost">{job.definition?.staminaCost}</DescriptionRow>
		<DescriptionRow term="Duration">
			{Duration.fromMillis(protoToMilliseconds(job.definition?.duration))
				.shiftTo('seconds')
				.toHuman({ unitDisplay: 'narrow' })}</DescriptionRow
		>
		<DescriptionRow term="Distance">{Math.round((job.routeInfo?.distance ?? 0) * 100) / 100}m</DescriptionRow>
		<DescriptionRow term="Traveltime">
			{Duration.fromMillis(protoToMilliseconds(job.routeInfo?.estimatedDuration))
				.shiftTo('seconds')
				.toHuman({ unitDisplay: 'narrow' })}</DescriptionRow
		>
	</DescriptionList>

	{#if ingredients.length}
		<Separator class="my-2" />
		<DescriptionList>
			<DescriptionRow term="Ingredients">
				{#each ingredients as ingredient, index}{index ? ', ' : ''}{rewardLabel(ingredient.id)}: {ingredient.quantity}{/each}
			</DescriptionRow>
		</DescriptionList>
	{/if}

	<Separator class="my-2" />
	<DescriptionList>
		<DescriptionRow term="Rewards">
			XP: {job.definition?.rewards?.experience ?? 0}{#each job.definition?.rewards?.items ?? [] as rewardItem}, {rewardLabel(
					rewardItem.id,
				)}: {rewardItem.quantity}{/each}
		</DescriptionRow>
	</DescriptionList>
</Card>
