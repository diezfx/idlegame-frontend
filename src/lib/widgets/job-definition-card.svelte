<script lang="ts">
	import { onMount } from 'svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { cn } from '$lib/utils';
	import { protoToMilliseconds } from '$lib/utils/prototime';
	import { Duration } from 'luxon';
	import { JobSubType as JobSubTypeEnum } from '../../gen/v1/masterdata_pb';
	import type { BattleJobInfo, ProductionJobInfo } from '../../gen/v1/service_pb';
	import { masterdataStore } from '$lib/stores/masterdata.svelte';
	import DescriptionList from '$lib/components/ui/descriptionlist/DescriptionList.svelte';
	import DescriptionRow from '$lib/components/ui/descriptionlist/DescriptionRow.svelte';

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

<Card {onclick} class={cn('w-full border', interactive ? 'cursor-pointer' : '', className)}>
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

	<div class="space-y-1.5">
		<div class="text-xs font-semibold uppercase tracking-wider text-gray-600">Rewards</div>
		<div class="flex flex-wrap gap-1.5">
			<span
				class="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-800"
			>
				XP
				<span class="rounded bg-emerald-100 px-1 py-0.5 text-[10px]">+{job.definition?.rewards?.experience ?? 0}</span>
			</span>
			{#each job.definition?.rewards?.items ?? [] as rewardItem}
				<span class="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs">
					<span class="font-medium">{rewardLabel(rewardItem.id)}</span>
					<span class="rounded bg-gray-100 px-1 py-0.5 text-[10px]">x{rewardItem.quantity}</span>
				</span>
			{/each}
		</div>
	</div>

	{#if ingredients.length}
		<div class="space-y-1.5">
			<div class="text-xs font-semibold uppercase tracking-wider text-gray-600">Ingredients</div>
			<div class="flex flex-wrap gap-1.5">
				{#each ingredients as ingredient}
					<span class="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs">
						<span class="font-medium">{rewardLabel(ingredient.id)}</span>
						<span class="rounded bg-gray-100 px-1 py-0.5 text-[10px]">x{ingredient.quantity}</span>
					</span>
				{/each}
			</div>
		</div>
	{/if}
</Card>
