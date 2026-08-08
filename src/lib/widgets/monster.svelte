<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import { cn } from '$lib/utils';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import { masterdataStore } from '$lib/stores/masterdata.svelte';
	import { JobSubType } from '$gen/v1/masterdata_pb';
	import DescriptionList from '$lib/components/ui/descriptionlist/DescriptionList.svelte';
	import DescriptionRow from '$lib/components/ui/descriptionlist/DescriptionRow.svelte';
	let {
		monId,
		class: classname,
		itemDeleteAction,
		openEquipDialog,
		...props
	}: {
		monId: string;
		class?: string;
		itemDeleteAction?: (itemID: string) => void;
		openEquipDialog?: () => void;
		[key: string]: any;
	} = $props();

	const monster = $derived(gameStateStore.Monsters.get(monId));
	const jobMasterdata = $derived(await masterdataStore.getProductionJobs());
	const monJob = $derived(
		monster?.participant?.jobEntityId ? gameStateStore.Jobs.get(monster.participant.jobEntityId) : undefined,
	);
</script>

{#if monster}
	<Card {...props} class={cn('w-full', classname)} title={monster.identity?.name}>
		<DescriptionList class="gap-y-2 text-sm">
			<DescriptionRow term="Level" class="text-right">{monster.stat?.level}</DescriptionRow>
			<DescriptionRow term="HP">
				<Progress
					showLabel={true}
					foreground="bg-emerald-500"
					background="bg-emerald-500/20"
					value={monster.stat?.health ?? 0}
					max={monster.stat?.maxHealth ?? 100}
				/>
			</DescriptionRow>
			<DescriptionRow term="Stamina">
				<Progress
					class="w-full"
					showLabel={true}
					foreground="bg-yellow-200"
					background="bg-primary/20"
					value={monster.stat?.stamina ?? 0}
					max={monster.stat?.maxStamina ?? 100}
				/>
			</DescriptionRow>
			<DescriptionRow term="Experience" class="text-right">{monster.stat?.experience}</DescriptionRow>
			<DescriptionRow term="STR · AGI · INT · VIT" class="text-right">
				{monster.stat?.strength ?? 0} · {monster.stat?.agility ?? 0} · {monster.stat?.intelligence ?? 0} · {monster.stat
					?.vitality ?? 0}
			</DescriptionRow>
			<DescriptionRow term="Job" class="text-right">
				{#if monJob}
					<!--TODO add current status, e.g. for gather and production this should show current action, e.g walking, with a progress bar-->
					{JobSubType[jobMasterdata.find((j) => j.definition?.id == monJob.definitionId)?.definition?.subType!]}
				{:else}
					Idle
				{/if}
			</DescriptionRow>
			<DescriptionRow term="Position" class="text-right">
				{Math.round(monster.position?.x ?? 0)}, {Math.round(monster.position?.y ?? 0)}
			</DescriptionRow>
			<DescriptionRow term="Equipment">
				<div class="flex flex-col items-end gap-1">
					{#each monster.equippedItems as item (item.id)}
						<div class="flex items-center gap-2">
							<span>{item.id}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</span>
							{#if itemDeleteAction}
								<button
									type="button"
									class="text-xs text-destructive hover:underline"
									onclick={(event) => {
										event.stopPropagation();
										itemDeleteAction(item.id);
									}}
								>
									Remove
								</button>
							{/if}
						</div>
					{/each}
					{#if monster.equippedItems.length === 0}
						<span class="text-muted-foreground">None</span>
					{/if}
					{#if openEquipDialog}
						<button
							type="button"
							class="text-primary hover:underline"
							onclick={(event) => {
								event.stopPropagation();
								openEquipDialog();
							}}
						>
							{monster.equippedItems.length < 3 ? 'Add equipment' : 'Change equipment'}
						</button>
					{/if}
				</div>
			</DescriptionRow>
		</DescriptionList>
	</Card>
{/if}
