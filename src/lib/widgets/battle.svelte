<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import type { BattleMonster, Job } from '$lib/service/jobs';
	import Swords from 'lucide-svelte/icons/swords';
	import Cross from 'lucide-svelte/icons/cross';
	import { Role } from '../../gen/v1/domain_pb';
	let { job, ...props }: { job: Job; [key: string]: any } = $props();

	const playerMonsters = $derived(job.monsters.filter((m) => m.participant?.role === Role.PLAYER));
	const enemyMonsters = $derived(job.monsters.filter((m) => m.participant?.role === Role.ENEMY));

	import { DateTime } from 'luxon';

	import { protoToMilliseconds } from '$lib/utils/prototime';

	const attackCooldown = 5000;
	let animationFrameId: number | undefined;

	let getNextAttackInMs = (lastAttacked: number): number => {
		const lastAttack = DateTime.fromMillis(lastAttacked);
		const nextAttack = lastAttack.plus({ seconds: attackCooldown / 1000 + 0.1 });
		return Math.max(0, nextAttack.diffNow().as('milliseconds'));
	};

	let playerMonsterCurrent = $derived(
		attackCooldown - getNextAttackInMs(protoToMilliseconds(playerMonsters[0].lastAction!.lastAttackedAt)),
	);
	let enemyMonsterCurrent = $derived(
		attackCooldown - getNextAttackInMs(protoToMilliseconds(enemyMonsters[0].lastAction!.lastAttackedAt)),
	);

	let animate = (currentTime: number) => {
		playerMonsterCurrent =
			attackCooldown - getNextAttackInMs(protoToMilliseconds(playerMonsters[0].lastAction!.lastAttackedAt));
		enemyMonsterCurrent =
			attackCooldown - getNextAttackInMs(protoToMilliseconds(enemyMonsters[0].lastAction!.lastAttackedAt));
		if (playerMonsterCurrent == attackCooldown || enemyMonsterCurrent == attackCooldown) {
		}
		requestAnimationFrame(animate);
	};
	$effect(() => {
		animationFrameId = requestAnimationFrame(animate);
		console.log(playerMonsterCurrent);
	});

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

{#snippet monster(mon: BattleMonster)}
	<Card {...props} class="w-[350px]" title={mon.identity?.name}>
		<div class="grid grid-cols-3">
			<Cross class=" text-red-500" />
			<Progress value={mon.stat?.health} max={mon.stat?.maxHealth} class="col-span-2" />
			<Swords />
			<p class="col-span-2">10</p>
			<p>NextAttack</p>
			<Progress class="col-span-2" value={playerMonsterCurrent} max={attackCooldown} />
		</div>
	</Card>
{/snippet}

<Card {...props} class="w-[350px]" title={job.def!.jobDefId}>
	<div class="grid grid-cols-2">
		<p>Monster</p>
		<p>{job.monsters.map((m) => m.identity!.name)}</p>
		<p>Updated</p>
		<p>{timeAgo(DateTime.fromMillis(protoToMilliseconds(job.jobState!.updatedAt)))}</p>
		<p>Started</p>
		<p>{timeAgo(DateTime.fromMillis(protoToMilliseconds(job.entity!.createdAt)))}</p>

		<p class="col-span-2">Rewards</p>
		{#each job.rewards!.inventory!.items as reward}
			<p>{reward.id}</p>
			<p>{reward.quantity}</p>
		{/each}
	</div>

	<div class="justify-center"><Button class="bg-red-500">STOP</Button></div>
</Card>

<div class="grid grid-cols-2 gap-2">
	<div>
		<p>My Monsters</p>
		{#each playerMonsters as mon}
			{@render monster(mon)}
		{/each}
	</div>
	<div>
		<p>Enemies</p>
		{#each enemyMonsters as mon}
			{@render monster(mon)}
		{/each}
	</div>
</div>
