<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import { JobsClient } from '$lib/service/jobs';
	import Button from '$lib/components/ui/button/button.svelte';
	import MonsterView from '$lib/widgets/monster.svelte';
	import JobView from '$lib/widgets/job.svelte';
	import log from '$lib/log/log.js';
	import { userStore } from '$lib/stores/user.svelte.js';
	import { goto, invalidateAll } from '$app/navigation';
	import type { Monster } from '../../../gen/v1/domain_pb.js';
	import Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import { protoToMilliseconds } from '$lib/utils/prototime.js';
	import { Duration } from 'luxon';
	import type { BattleJobInfo } from '../../../gen/v1/service_pb.js';
	import { cn } from '$lib/utils.js';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	import { Swords, Footprints, Zap, Sparkles } from 'lucide-svelte';

	let { data } = $props();

	const selectedColor = 'bg-green-200';

	const user = userStore.getUser();
	const activeJobs = $derived(gameStateStore.Jobs);
	const monsters = $derived(gameStateStore.Monsters);
	const jobClient = new JobsClient(fetch);

	let openDialog = $state(false);
	let selectedMonster: Monster | undefined = $state(undefined);
	let selectedJob: BattleJobInfo | undefined = $state(undefined);

	function dialogClicked(m: Monster): void {
		openDialog = false;
		selectedMonster = m;
	}
	function reset(): void {
		selectedMonster = undefined;
		selectedJob = undefined;
	}

	function isSelectedJob(jobID: string): boolean {
		return selectedJob?.definition!.id == jobID;
	}

	async function startJob(): Promise<void> {
		if (selectedJob == undefined || selectedMonster == undefined) {
			log.error('No job or monster selected');
			return;
		}
		await jobClient.startBattleJob({
			jobDefinitionId: selectedJob?.definition!.id,
			userId: user.userId,
			monsterId: selectedMonster.entity!.id,
		});
		reset();
		invalidateAll();
	}
</script>

<div>Start new Job</div>
<div class="grid grid-cols-3 gap-2">
	{#if selectedMonster != undefined}
		<MonsterView class={selectedColor} monId={selectedMonster.entity?.id!} />
	{/if}
	<Card
		onclick={() => {
			openDialog = true;
			selectedMonster;
		}}
		class="button text-center text-green-500 text-2xl hover:{selectedColor}"
		>+
	</Card>
</div>

<div>Currently active Jobs</div>
<div class="grid grid-cols-3 gap-2 items-start">
	{#each activeJobs as [_, job]}
		<JobView
			onStop={() => gameStateStore.stopJob(job.entity?.id!)}
			jobID={job.entity!.id}
			onclick={() => goto(`/jobs/battles/${job.entity?.id!}`)}
		/>
	{/each}
</div>

<Dialog open={openDialog} class="max-w-5xl" onClose={() => (openDialog = false)}>
	Choose Monster
	<div class="grid grid-cols-3 gap-2 items-start">
		{#each monsters as [_, monster]}
			<MonsterView onclick={() => dialogClicked(monster)} monId={monster.entity?.id!} class="hover:bg-gray-200" />
		{/each}
	</div>
</Dialog>

<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
	{#each data.masterdata as job}
		<Card
			class={cn(
				isSelectedJob(job.definition!.id)
					? 'ring-2 ring-red-300 bg-red-50/40 border-red-200'
					: 'hover:border-red-200 hover:shadow-md',
				'cursor-pointer border transition-all duration-150',
			)}
			onclick={() => (selectedJob = job)}
		>
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-red-100 text-red-700">
							<Swords size={16} />
						</span>
						<div class="font-semibold tracking-tight text-gray-900">{job.definition!.id}</div>
					</div>
					<span class="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">BATTLE</span>
				</div>

				<div class="grid grid-cols-2 gap-2 text-sm">
					<div class="rounded-md border border-gray-200 bg-white px-2 py-1.5">
						<div class="text-[11px] uppercase text-gray-500">Required Lv</div>
						<div class="font-semibold">{job.definition!.levelRequirement}</div>
					</div>
					<div class="rounded-md border border-gray-200 bg-white px-2 py-1.5">
						<div class="text-[11px] uppercase text-gray-500">Stamina</div>
						<div class="font-semibold">{job.definition!.staminaCost}</div>
					</div>
					<div class="rounded-md border border-gray-200 bg-white px-2 py-1.5">
						<div class="text-[11px] uppercase text-gray-500">Distance</div>
						<div class="font-semibold">{Math.round(job.routeInfo?.distance! * 100) / 100}m</div>
					</div>
				</div>

				<div class="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-700">
					<span class="inline-flex items-center gap-1"><Footprints size={13} /> Travel</span>
					<span class="text-right">
						<span class="font-medium">{Math.round(job.routeInfo?.distance! * 100) / 100}m</span>
						<span class="mx-1 text-gray-400">/</span>
						<span>
							{Duration.fromMillis(protoToMilliseconds(job.routeInfo?.estimatedDuration!))
								.shiftTo('seconds')
								.toHuman({ unitDisplay: 'narrow' })}
						</span>
					</span>
				</div>
				<div class="space-y-1.5">
					<div class="text-xs font-semibold uppercase tracking-wider text-gray-600">Rewards</div>
					<div class="flex flex-wrap gap-1.5">
						<span class="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
							XP
							<span class="rounded bg-emerald-100 px-1 py-0.5 text-[10px]">+{job.definition!.rewards?.experience}</span>
						</span>
						{#each job.definition!.rewards?.items ?? [] as rewardItem}
							<span class="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs">
								<span class="font-medium">{rewardItem.id}</span>
								<span class="rounded bg-gray-100 px-1 py-0.5 text-[10px]">x{rewardItem.quantity}</span>
							</span>
						{/each}
					</div>
				</div>
				<div class="flex items-center gap-1.5 text-[11px] text-gray-500">
					<Zap size={12} />
					<Sparkles size={12} />
					<span>Higher level monsters finish these faster.</span>
				</div>
			</div>
		</Card>
	{/each}
</div>

<Button onclick={startJob}>Start Battle</Button>
