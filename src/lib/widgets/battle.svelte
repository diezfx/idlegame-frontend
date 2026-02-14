<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import type { Job } from '$lib/service/jobs';
	import Swords from 'lucide-svelte/icons/swords';
	import Cross from 'lucide-svelte/icons/cross';
	import { Role, type Monster } from '../../gen/v1/domain_pb';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';

	let { job, ...props }: { job: Job; [key: string]: any } = $props();

	const monsters = $derived(
		job.monsters.map((id) => gameStateStore.Monsters.get(id)).filter((m): m is Monster => m != null),
	);
	const playerMonsters = $derived(monsters.filter((m) => m.participant?.role === Role.PLAYER));
	const enemyMonsters = $derived(monsters.filter((m) => m.participant?.role === Role.ENEMY));

	import { DateTime } from 'luxon';

	import { protoToMilliseconds } from '$lib/utils/prototime';
	import { jobStatusText } from '$lib/utils/enumtext';

	const attackCooldown = 5000;
	let animationFrameId: number | undefined;
	let nowMs = $state(Date.now());

	let getAttackProgress = (mon: Monster | undefined): number => {
		const lastAttackedAt = mon?.lastAction?.lastAttackedAt;
		if (lastAttackedAt == null) return 0;
		const elapsed = Math.max(0, nowMs - protoToMilliseconds(lastAttackedAt));
		return Math.min(attackCooldown, elapsed);
	};

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

{#snippet monster(mon: Monster)}
	<Card {...props} class="w-[350px]" title={mon.identity?.name}>
		<div class="grid grid-cols-3">
			<Cross class=" text-red-500" />
			<div class="col-span-2">
				<Progress
					showLabel={true}
					foreground="bg-red-500"
					background="bg-gray-200"
					value={mon.stat?.health ?? 0}
					max={mon.stat?.maxHealth ?? 1}
				/>
			</div>
			<Swords />
			<p class="col-span-2">10</p>
			<p>NextAttack</p>
			<div class="col-span-2">
				<Progress
					transition={false}
					foreground="bg-blue-200"
					background="bg-gray-200"
					value={getAttackProgress(mon)}
					max={attackCooldown}
				/>
			</div>
		</div>
	</Card>
{/snippet}

<Card {...props} class="w-[350px]" title={job.def!.jobDefId}>
	<div class="grid grid-cols-2">
		<p>Monster</p>
		<p>{monsters.map((m) => m.identity?.name ?? m.entity?.id ?? 'Unknown').join(', ')}</p>
		<p>Updated</p>
		<p>{timeAgo(DateTime.fromMillis(protoToMilliseconds(job.jobState!.updatedAt)))}</p>
		<p>Started</p>
		<p>{timeAgo(DateTime.fromMillis(protoToMilliseconds(job.entity!.createdAt)))}</p>
		<p>State</p>
		<p>{jobStatusText(job.jobState?.status!)}</p>

		<p class="col-span-2">Rewards</p>
		{#each (job.rewards?.inventory?.items ?? []) as reward}
			<p>{reward.id}</p>
			<p>{reward.quantity}</p>
		{/each}
	</div>

	<div class="justify-center"><Button class="bg-red-500">STOP</Button></div>
</Card>

<div class="grid grid-cols-2 gap-2">
	<div>
		<p>My Monsters</p>
		{#each playerMonsters as mon (mon.entity?.id)}
			{@render monster(mon)}
		{/each}
	</div>
	<div>
		<p>Enemies</p>
		{#each enemyMonsters as mon (mon.entity?.id)}
			{@render monster(mon)}
		{/each}
	</div>
</div>
