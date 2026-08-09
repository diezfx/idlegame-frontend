<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import ItemView from '$lib/widgets/item.svelte';

	import { DateTime } from 'luxon';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import { Action, type ActionState, JobStatus } from '$gen/v1/domain_pb';
	import { protoToMilliseconds } from '$lib/utils/prototime';
	let {
		jobID,
		onclick,
		onStop,
	}: {
		jobID: string;
		onclick?: () => void;
		onStop?: () => void;
	} = $props();

	const units: Intl.RelativeTimeFormatUnit[] = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];

	export const timeAgo = (dateTime: DateTime) => {
		const diff = dateTime.diffNow().shiftTo(...units);
		const unit = units.find((unit) => diff.get(unit) !== 0) || 'second';

		const relativeFormatter = new Intl.RelativeTimeFormat('en', {
			numeric: 'auto',
		});
		return relativeFormatter.format(Math.trunc(diff.as(unit)), unit);
	};

	const job = $derived(gameStateStore.Jobs.get(jobID)!);
	const inv = $derived(gameStateStore.Inventories.get(jobID));
	const monsters = $derived(
		(job?.monsters ?? [])
			.map((id) => gameStateStore.Monsters.get(id))
			.filter((m): m is NonNullable<typeof m> => m != null),
	);
	const mon = $derived(monsters.at(0))!;
	let animationFrameId: number | undefined;
	let nowMs = $state(Date.now());

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

	const currentAction = $derived.by(() => {
		return job?.actionStates
			.filter((state) => state.action !== Action.UNSPECIFIED && state.action !== Action.CONSUME)
			.toSorted((left, right) => actionStartedAt(right) - actionStartedAt(left))[0];
	});

	function actionStartedAt(state: ActionState): number {
		return protoToMilliseconds(state.lastUsedAt);
	}

	function actionDuration(state: ActionState): number {
		return protoToMilliseconds(state.nextUseAt) - actionStartedAt(state);
	}

	function handleStopClick(event: MouseEvent): void {
		event.stopPropagation();
		onStop?.();
	}
</script>

<Card {onclick} title={job.definitionId} class="w-full">
	<div class="p-4 space-y-4">
		<div class="space-y-1">
			<div class="flex items-center justify-between gap-2">
				<h3>Current action</h3>
				<span class="text-sm font-medium">
					{currentAction ? Action[currentAction.action] : job.jobState ? JobStatus[job.jobState.status] : 'IDLE'}
				</span>
			</div>
			{#if currentAction && actionDuration(currentAction) > 0}
				<Progress
					transition={false}
					value={nowMs - actionStartedAt(currentAction)}
					max={actionDuration(currentAction)}
				/>
			{/if}
		</div>
		<h3>Monsters</h3>
		<Card class="gap-2 p-2" title={mon.identity?.name}>
			<span>Stamina</span>
			<Progress
				showLabel={true}
				foreground="bg-yellow-200"
				background="bg-yellow-200/30"
				value={mon.stat?.stamina ?? 0}
				max={mon.stat?.maxStamina ?? 100}
			/>
		</Card>
		<h3>Inventory</h3>
		<Card class="gap-1 p-1">
			<Progress
				class="p-2"
				showLabel={true}
				foreground="bg-cyan-200"
				background="bg-cyan-200/50"
				value={inv?.used ?? 0}
				max={inv?.inventory?.capacity ?? 100}
			></Progress>
			<div class="grid grid-cols-3 gap-1 mt-2">
				{#each inv!.inventory!.items! as item (item.id)}
					<ItemView {item} class="scale bg-secondary text-secondary-foreground" />
				{/each}
			</div>
		</Card>
	</div>

	<!-- Action Footer -->
	<div class="p-4 bg-muted/50 border-t border-border rounded-b-xl flex justify-center">
		<Button
			class="w-full bg-destructive hover:bg-destructive/90 text-primary-foreground font-medium shadow-sm hover:shadow transition-all"
			onclick={handleStopClick}
		>
			Stop Job
		</Button>
	</div>
</Card>
