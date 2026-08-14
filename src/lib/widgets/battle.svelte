<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import DescriptionList from '$lib/components/ui/descriptionlist/DescriptionList.svelte';
	import DescriptionRow from '$lib/components/ui/descriptionlist/DescriptionRow.svelte';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import type { Job } from '../../gen/v1/domain_pb';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import { getServicesContext } from '$lib/service/context';
	import { protoToMilliseconds } from '$lib/utils/prototime';
	import type { ActionState, Event, Monster, Stat } from '../../gen/v1/domain_pb';
	import { Action, Role } from '../../gen/v1/domain_pb';
	import EventLog from './event-log.svelte';

	let { job }: { job: Job; [key: string]: any } = $props();
	const { jobs: jobService } = getServicesContext();

	let animationFrameId: number | undefined;
	let nowMs = $state(Date.now());
	let stopping = $state(false);

	const monsters = $derived.by(() => {
		const map = new Map<string, Monster>();
		for (const id of job.monsters) {
			const monster = gameStateStore.Monsters.get(id);
			if (monster) {
				map.set(id, monster);
			}
		}
		return map;
	});

	const playerMonsters = $derived(
		monsters
			.values()
			.filter((m) => m.participant?.role === Role.PLAYER)
			.toArray(),
	);
	const enemyMonsters = $derived(
		monsters
			.values()
			.filter((m) => m.participant?.role === Role.ENEMY)
			.toArray(),
	);

	const playerBattleMonsters = $derived(job.monsters.filter((x) => playerMonsters.find((pm) => pm.entity?.id == x)));
	const enemyBattleMonsters = $derived(job.monsters.filter((x) => enemyMonsters.find((pm) => pm.entity?.id == x)));

	let animate = () => {
		nowMs = Date.now();
		animationFrameId = requestAnimationFrame(animate);
	};
	$effect(() => {
		animationFrameId = requestAnimationFrame(animate);
		return () => {
			if (animationFrameId !== undefined) {
				cancelAnimationFrame(animationFrameId);
				animationFrameId = undefined;
			}
		};
	});

	async function stopBattle(): Promise<void> {
		if (!job.entity?.id || stopping) return;
		stopping = true;
		try {
			await jobService.stopJob(job.entity.id);
			await goto('/jobs/battles');
		} finally {
			stopping = false;
		}
	}

	function calculateLastAttack(actionStates?: ActionState[]): number {
		if (actionStates == undefined) {
			return 0;
		}
		const idx = actionStates.findIndex((as) => as.action == Action.ATTACK);
		if (idx == -1) {
			return 0;
		}
		return protoToMilliseconds(actionStates[idx].lastUsedAt);
	}

	function calculateDeltaAction(actionStates?: ActionState[]): number {
		if (actionStates == undefined) {
			return 0;
		}
		const idx = actionStates.findIndex((as) => as.action == Action.ATTACK);
		if (idx == -1) {
			return 0;
		}
		const last = protoToMilliseconds(actionStates[idx].lastUsedAt);
		const next = protoToMilliseconds(actionStates[idx].nextUseAt);
		return next - last;
	}
</script>

<div class="space-y-4">
	<section class="rounded-xl border border-border bg-card p-3">
		<div class="grid grid-cols-2">
			<div>
				<h2 class="text-sm font-semibold text-foreground">Your Team</h2>
				<div class="grid gap-3 grid-cols-3">
					{#each playerBattleMonsters as mon, i (mon)}
						<Card class="p-2 " title={monsters.get(mon)!.identity?.name}>
							<DescriptionList>
								<DescriptionRow term="HP">
									<Progress
										foreground="bg-emerald-500"
										background="bg-emerald-500/20"
										value={monsters.get(mon)!.stat?.health ?? 0}
										max={monsters.get(mon)!.stat?.maxHealth ?? 1}
										showLabel={true}
									/></DescriptionRow
								>

								<DescriptionRow term="STR">{monsters.get(mon)!.stat?.strength ?? 0}</DescriptionRow>
								<DescriptionRow term="AGI">{monsters.get(mon)!.stat?.agility ?? 0}</DescriptionRow>
								<DescriptionRow term="INT">{monsters.get(mon)!.stat?.intelligence ?? 0}</DescriptionRow>
								<DescriptionRow term="VIT">{monsters.get(mon)!.stat?.vitality ?? 0}</DescriptionRow>
								<DescriptionRow term="NextAction" class="self-center">
									<Progress
										transition={false}
										foreground="bg-primary"
										background="bg-muted"
										value={nowMs - calculateLastAttack(monsters.get(mon)?.actionStates)}
										max={calculateDeltaAction(monsters.get(mon)?.actionStates)}
									/>
								</DescriptionRow>
							</DescriptionList>
						</Card>
					{/each}
				</div>
			</div>

			<div>
				<div class="mb-2 flex items-center justify-between">
					<h2 class="text-sm font-semibold text-foreground">Enemies</h2>
				</div>
				<div class="grid gap-3 grid-cols-3">
					{#each enemyBattleMonsters as mon (mon)}
						<Card class="p-2" title={monsters.get(mon)!.identity?.name}>
							<DescriptionList>
								<DescriptionRow term="HP">
									<Progress
										foreground="bg-emerald-500"
										background="bg-emerald-500/20"
										value={monsters.get(mon)!.stat?.health ?? 0}
										max={monsters.get(mon)!.stat?.maxHealth ?? 1}
										showLabel={true}
									/></DescriptionRow
								>

								<DescriptionRow term="STR">{monsters.get(mon)!.stat?.strength ?? 0}</DescriptionRow>
								<DescriptionRow term="AGI">{monsters.get(mon)!.stat?.agility ?? 0}</DescriptionRow>
								<DescriptionRow term="INT">{monsters.get(mon)!.stat?.intelligence ?? 0}</DescriptionRow>
								<DescriptionRow term="VIT">{monsters.get(mon)!.stat?.vitality ?? 0}</DescriptionRow>
								<DescriptionRow term="NextAction" class="self-center">
									<Progress
										transition={false}
										class="h5"
										foreground="bg-primary"
										background="bg-muted"
										value={nowMs - calculateLastAttack(monsters.get(mon)?.actionStates)}
										max={calculateDeltaAction(monsters.get(mon)?.actionStates)}
									/>
								</DescriptionRow>
							</DescriptionList>
						</Card>
					{/each}
				</div>
			</div>
		</div>
	</section>
	<EventLog jobId={job.entity?.id}></EventLog>
</div>
