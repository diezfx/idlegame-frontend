<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import DescriptionList from '$lib/components/ui/descriptionlist/DescriptionList.svelte';
	import DescriptionRow from '$lib/components/ui/descriptionlist/DescriptionRow.svelte';
	import Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import JobDefinitionCard from '$lib/widgets/job-definition-card.svelte';
	import MonsterView from '$lib/widgets/monster.svelte';
	import type { BattleJobInfo, ProductionJobInfo } from '$gen/v1/service_pb';

	type SelectableJob = {
		definition?: ProductionJobInfo['definition'] | BattleJobInfo['definition'];
		routeInfo?: ProductionJobInfo['routeInfo'] | BattleJobInfo['routeInfo'];
	};

	let {
		jobs,
		startLabel,
		onStart,
	}: {
		jobs: SelectableJob[];
		startLabel: string;
		onStart: (selection: { jobDefinitionId: string; monsterId: string }) => Promise<void>;
	} = $props();

	const monsters = $derived(gameStateStore.Monsters);
	const availableMonsterIds = $derived(
		Array.from(monsters.values())
			.filter((monster) => monster.participant == undefined)
			.map((monster) => monster.entity?.id)
			.filter((monsterId): monsterId is string => monsterId != undefined),
	);

	let openMonsterDialog = $state(false);
	let selectedMonsterId: string | undefined = $state(undefined);
	let selectedJob: SelectableJob | undefined = $state(undefined);

	const selectedMonster = $derived(selectedMonsterId ? monsters.get(selectedMonsterId) : undefined);
	const jobStartable = $derived.by(() => selectedJob?.definition?.id != undefined && selectedMonster != undefined);

	function selectMonster(monsterId: string): void {
		selectedMonsterId = monsterId;
		openMonsterDialog = false;
	}

	async function startJob(): Promise<void> {
		const jobDefinitionId = selectedJob?.definition?.id;
		const monsterId = selectedMonster?.entity?.id;
		if (!jobDefinitionId || !monsterId) return;

		await onStart({ jobDefinitionId, monsterId });
		selectedMonsterId = undefined;
		selectedJob = undefined;
	}
</script>

<Card class="mb-4 p-4">
	<div class="mt-3 grid grid-cols-2 gap-3">
		<Card title="Selected Monster" class="min-h-[8.5rem]" onclick={() => (openMonsterDialog = true)}>
			<div class="grid min-h-[6rem] items-center">
				{#if selectedMonster}
					<DescriptionList class="w-full">
						<DescriptionRow term="Name">{selectedMonster.identity?.name}</DescriptionRow>
						<DescriptionRow term="Level">{selectedMonster.stat?.level}</DescriptionRow>
						<DescriptionRow term="Stamina">
							{selectedMonster.stat?.stamina}/{selectedMonster.stat?.maxStamina}
						</DescriptionRow>
						<DescriptionRow term="Position">
							X:{Math.round(selectedMonster.position?.x ?? 0)} Y:{Math.round(selectedMonster.position?.y ?? 0)}
						</DescriptionRow>
					</DescriptionList>
				{:else}
					<div class="w-full text-center">No monster selected</div>
				{/if}
			</div>
		</Card>

		<Card title="Selected Job" class="min-h-[8.5rem]">
			<div class="grid min-h-[6rem] items-center">
				{#if selectedJob}
					<DescriptionList class="w-full">
						<DescriptionRow term="ID">{selectedJob.definition?.id}</DescriptionRow>
						<DescriptionRow term="Stamina">{selectedJob.definition?.staminaCost}</DescriptionRow>
						<DescriptionRow term="Reward XP">{selectedJob.definition?.rewards?.experience}</DescriptionRow>
					</DescriptionList>
				{:else}
					<div class="w-full text-center">No job selected</div>
				{/if}
			</div>
		</Card>
	</div>

	<div class="mt-3 grid grid-cols-2 gap-2">
		<Button onclick={startJob} disabled={!jobStartable} class="col-span-2 w-auto">{startLabel}</Button>
	</div>
</Card>

<div class="grid grid-cols-3 gap-3">
	{#each jobs as job (job)}
		<JobDefinitionCard
			{job}
			selected={selectedJob?.definition?.id === job.definition?.id}
			onclick={() => (selectedJob = job)}
		/>
	{/each}
</div>

<Dialog open={openMonsterDialog} class="max-w-5xl" onClose={() => (openMonsterDialog = false)}>
	Choose Monster
	<div class="grid grid-cols-3 gap-2">
		{#each availableMonsterIds as monsterId (monsterId)}
			<MonsterView onclick={() => selectMonster(monsterId)} monId={monsterId} class="hover:bg-muted" />
		{/each}
	</div>
</Dialog>
