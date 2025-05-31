<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Progress from '$lib/components/ui/progress.svelte';
	import type { BattleJob, Job, JobMasterdata } from '$lib/service/jobs';
	import Swords from 'lucide-svelte/icons/swords';
	import Cross from 'lucide-svelte/icons/cross';
	let { job, ...props }: { job: Job & BattleJob; [key: string]: any } = $props();

	import { DateTime } from 'luxon';

	import { Tween } from 'svelte/motion';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import log from '$lib/log/log';

	const attackCooldown = 5000;
	let animationFrameId: number | undefined;
	let interval: number | undefined;

	let getNextAttackInMs = (lastAttacked: string): number => {
		const lastAttack = DateTime.fromISO(lastAttacked);
		const nextAttack = lastAttack.plus({ seconds: attackCooldown / 1000 + 0.5 });
		return Math.max(0, nextAttack.diffNow().as('milliseconds'));
	};

	let playerMonsterCurrent = $state(attackCooldown - getNextAttackInMs(job.playerMonsters[0].lastAttacked));
	let enemyMonsterCurrent = $state(attackCooldown - getNextAttackInMs(job.enemyMonsters[0].lastAttacked));

	let animate = (currentTime: number) => {
		playerMonsterCurrent = attackCooldown - getNextAttackInMs(job.playerMonsters[0].lastAttacked);
		enemyMonsterCurrent = attackCooldown - getNextAttackInMs(job.enemyMonsters[0].lastAttacked);
		requestAnimationFrame(animate);
	};
	const nextAttack = $derived(getNextAttackInMs(job.playerMonsters[0].lastAttacked));
	$effect(() => {
		animationFrameId = requestAnimationFrame(animate);
	});
	$effect(() => {
		if (interval) {
			clearInterval(interval);
		}
		interval = setInterval(
			() => {
				invalidateAll();
			},
			Math.max(1000, nextAttack),
		);
		return () => {
			clearInterval(interval);
		};
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

<Card.Root {...props} class="w-[350px]">
	<Card.Header>
		<Card.Title>{job.jobDefId}</Card.Title>
	</Card.Header>
	<Card.Content class="grid grid-cols-2">
		<p>Monster</p>
		<p>{job.monsterIds}</p>
		<p>Updated</p>
		<p>{timeAgo(DateTime.fromISO(job.updatedAt))}</p>
		<p>Started</p>
		<p>{timeAgo(DateTime.fromISO(job.startedAt))}</p>

		<p class="col-span-2">Rewards</p>
		{#each job.rewards as reward}
			<p>{reward.itemDefId}</p>
			<p>{reward.quantity}</p>
		{/each}
	</Card.Content>

	<Card.Footer class="justify-center"><Button class="bg-red-500">STOP</Button></Card.Footer>
</Card.Root>

<div class="grid grid-cols-2 gap-2">
	<div>
		<p>My Monsters</p>
		{#each job.playerMonsters as mon}
			<Card.Root {...props} class="w-[350px]">
				<Card.Header>
					<Card.Title>{mon.name}</Card.Title>
				</Card.Header>
				<Card.Content class="grid grid-cols-3">
					<Cross class=" text-red-500" />
					<Progress value={mon.health} max={mon.maxHealth} class="col-span-2" />
					<Swords />
					<p class="col-span-2">10</p>
					<p>LastAttack</p>
					<Progress value={playerMonsterCurrent} max={attackCooldown} />
				</Card.Content>

				<Card.Footer class="justify-center"><Button class="bg-red-500">STOP</Button></Card.Footer>
			</Card.Root>
		{/each}
	</div>
	<div>
		<p>Enemies</p>
		{#each job.enemyMonsters as mon}
			<Card.Root {...props} class="w-[350px]">
				<Card.Header>
					<Card.Title>{mon.id}</Card.Title>
				</Card.Header>
				<Card.Content class="grid grid-cols-2">
					<Progress value={mon.health} max={mon.maxHealth} />
					<p>lala</p>
					<p>AttackPower</p>
					<p>10</p>
					<p>LastAttack</p>
					<Progress value={enemyMonsterCurrent} max={attackCooldown} />
				</Card.Content>

				<Card.Footer class="justify-center"><Button class="bg-red-500">STOP</Button></Card.Footer>
			</Card.Root>
		{/each}
	</div>
</div>
