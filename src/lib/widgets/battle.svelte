<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import DescriptionList from '$lib/components/ui/descriptionlist/DescriptionList.svelte';
	import DescriptionRow from '$lib/components/ui/descriptionlist/DescriptionRow.svelte';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import type { Job } from '$lib/service/jobs';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import { jobStatusText } from '$lib/utils/enumtext';
	import { protoToMilliseconds } from '$lib/utils/prototime';
	import type { Event, LastAction, Monster, NextAction, Stat } from '../../gen/v1/domain_pb';
	import { Role } from '../../gen/v1/domain_pb';
	import { CircleDot, Clock3, ScrollText, Shield, Timer } from 'lucide-svelte';

	let { job }: { job: Job; [key: string]: any } = $props();

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

	const battleView = $derived(gameStateStore.getBattleView(job.entity?.id!));
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

	const playerBattleMonsters = $derived(
		battleView.monsters.filter((x) => playerMonsters.find((pm) => pm.entity?.id == x.entity?.id)),
	);
	const enemyBattleMonsters = $derived(
		battleView.monsters.filter((x) => enemyMonsters.find((pm) => pm.entity?.id == x.entity?.id)),
	);
	$effect(() => console.log(playerMonsters));
	$effect(() => console.log(battleView.monsters));
	const startedAtMs = $derived(job.entity?.createdAt ? protoToMilliseconds(job.entity.createdAt) : nowMs);

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
			await gameStateStore.stopJob(job.entity.id);
			await goto('/jobs/battles');
		} finally {
			stopping = false;
		}
	}

	function calculateLastAction(lastAction?: LastAction): number {
		if (lastAction == undefined) {
			return 0;
		}
		const last = Math.max(
			protoToMilliseconds(lastAction.lastAttackedAt),
			protoToMilliseconds(lastAction.lastConsumedAt),
			protoToMilliseconds(job.entity?.createdAt),
		);
		return last;
	}

	function calculateDeltaAction(lastAction?: LastAction, nextAction?: NextAction): number {
		if (nextAction == undefined) {
			return 0;
		}
		const last = calculateLastAction(lastAction);
		const next = protoToMilliseconds(nextAction.actionAt);
		console.log('delta is', next - last);
		return next - last;
	}
</script>

<div class="space-y-4">
	<section class="rounded-xl border border-gray-200 bg-white p-3">
		<div class="grid grid-cols-2">
			<div>
				<h2 class="text-sm font-semibold text-gray-900">Your Team</h2>
				<div class="grid gap-3 grid-cols-3">
					{#each playerBattleMonsters as mon, i (mon.entity?.id)}
						<Card class="p-2 " title={monsters.get(mon.entity?.id!)!.identity?.name}>
							<DescriptionList>
								<DescriptionRow term="HP">
									<Progress
										foreground="bg-red-500"
										background="bg-gray-200"
										value={mon.stat?.health ?? 0}
										max={mon.stat?.maxHealth ?? 1}
										showLabel={true}
									/></DescriptionRow
								>

								<DescriptionRow term="STR">{mon.stat?.strength ?? 0}</DescriptionRow>
								<DescriptionRow term="AGI">{mon.stat?.agility ?? 0}</DescriptionRow>
								<DescriptionRow term="INT">{mon.stat?.intelligence ?? 0}</DescriptionRow>
								<DescriptionRow term="VIT">{mon.stat?.vitality ?? 0}</DescriptionRow>
								<DescriptionRow term="NextAction" class="self-center">
									<Progress
										transition={false}
										foreground="bg-blue-300"
										background="bg-gray-200"
										value={nowMs - calculateLastAction(monsters.get(mon.entity?.id!)?.lastAction)}
										max={calculateDeltaAction(monsters.get(mon.entity?.id!)?.lastAction, mon.nextAction)}
									/>
								</DescriptionRow>
							</DescriptionList>
						</Card>
					{/each}
				</div>
			</div>

			<div>
				<div class="mb-2 flex items-center justify-between">
					<h2 class="text-sm font-semibold text-gray-900">Enemies</h2>
				</div>
				<div class="grid gap-3 grid-cols-3">
					{#each enemyBattleMonsters as mon (mon.entity?.id)}
						<Card class="p-2" title={monsters.get(mon.entity?.id!)!.identity?.name}>
							<DescriptionList>
								<DescriptionRow term="HP">
									<Progress
										foreground="bg-red-500"
										background="bg-gray-200"
										value={mon.stat?.health ?? 0}
										max={mon.stat?.maxHealth ?? 1}
										showLabel={true}
									/></DescriptionRow
								>

								<DescriptionRow term="STR">{mon.stat?.strength ?? 0}</DescriptionRow>
								<DescriptionRow term="AGI">{mon.stat?.agility ?? 0}</DescriptionRow>
								<DescriptionRow term="INT">{mon.stat?.intelligence ?? 0}</DescriptionRow>
								<DescriptionRow term="VIT">{mon.stat?.vitality ?? 0}</DescriptionRow>
								<DescriptionRow term="NextAction" class="self-center">
									<Progress
										transition={false}
										class="h5"
										foreground="bg-blue-300"
										background="bg-gray-200"
										value={nowMs - calculateLastAction(monsters.get(mon.entity?.id!)?.lastAction)}
										max={calculateDeltaAction(monsters.get(mon.entity?.id!)?.lastAction, mon.nextAction)}
									/>
								</DescriptionRow>
							</DescriptionList>
						</Card>
					{/each}
				</div>
			</div>
		</div>
	</section>
</div>
