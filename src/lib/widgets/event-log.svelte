<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';

	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	import List from '$lib/components/ui/list/List.svelte';
	import ListElement from '$lib/components/ui/list/ListElement.svelte';
	import { JobStatus, type Event } from '$gen/v1/domain_pb';
	let {
		userId,
		jobId,
	}: {
		userId?: string;
		jobId?: string;
	} = $props();

	const events = $derived.by(() => {
		if (userId != undefined) {
			return gameStateStore.Events.filter((e) => e.eventContext?.userIds.includes(userId));
		}
		if (jobId != undefined) {
			return gameStateStore.Events.filter((e) => e.eventContext?.jobId == jobId);
		}
	});

	const eventText = (e: Event): string => {
		const eventData = e.eventData;
		const count = (amount: number, noun: string) => `${amount} ${noun}${amount === 1 ? '' : 's'}`;
		const monsterName = (id: string) => gameStateStore.Monsters.get(id)?.identity?.name ?? 'Unknown monster';

		switch (eventData.case) {
			case 'arriveEvent': {
				return 'The monsters arrived at their destination.';
			}
			case 'returnEvent': {
				return 'The monsters returned home.';
			}
			case 'workEvent': {
				return `The monsters completed a work cycle and spent ${count(eventData.value.staminaCost, 'stamina point')}.`;
			}
			case 'stopWorkingEvent': {
				return 'The monsters stopped working.';
			}
			case 'jobStatusChangedEvent': {
				switch (eventData.value.status) {
					case JobStatus.WAITING_INPUT:
						return 'The job paused because required ingredients are missing.';
					case JobStatus.WAITING_OUTPUT:
						return 'The job paused because its output does not fit in storage.';
					case JobStatus.WORKING:
						return 'The required inventory is available and work resumed.';
					default:
						return `The job status changed to ${JobStatus[eventData.value.status]}.`;
				}
			}
			case 'consumeItemEvent': {
				return `${monsterName(eventData.value.monsterId)} consumed ${eventData.value.quantity}× ${eventData.value.itemDefId}.`;
			}
			case 'cargoLoadedEvent': {
				return `${count(eventData.value.items.length, 'cargo stack')} loaded from ${eventData.value.sourceId}.`;
			}
			case 'cargoUnloadedEvent': {
				return `${count(eventData.value.items.length, 'cargo stack')} unloaded at ${eventData.value.targetId}.`;
			}
			case 'attackEvent': {
				return `${monsterName(eventData.value.attacker)} hit ${monsterName(eventData.value.target)} for ${eventData.value.damage} damage.`;
			}
			case 'startRecoveringEvent': {
				return `Monster ${eventData.value.monsterId} started recovering.`;
			}
			case 'defeatedEnemiesEvent': {
				return `${count(eventData.value.enemyIds.length, 'enemy')} defeated at a cost of ${count(eventData.value.staminaCost, 'stamina point')}.`;
			}
			case 'nextRoundEnemiesEvent': {
				return `A new battle round began against ${count(eventData.value.enemies.length, 'enemy')}.`;
			}
			case 'jobStartedEvent': {
				return `The ${eventData.value.definitionId} job started with ${count(eventData.value.monsterIds.length, 'monster')}.`;
			}
			case 'jobFinishedEvent': {
				return `Job ${eventData.value.jobId} finished.`;
			}
			case 'equippedEvent': {
				return `Monster ${eventData.value.monsterId} equipped ${eventData.value.quantity}× ${eventData.value.itemDefId}.`;
			}
			case 'unequippedEvent': {
				return `Monster ${eventData.value.monsterId} unequipped ${eventData.value.quantity}× ${eventData.value.itemDefId}.`;
			}
			case 'playerLocationCreatedEvent': {
				return `You established a presence at ${eventData.value.definitionId}.`;
			}
			case 'exportRequestCreatedEvent': {
				return `New export request for ${eventData.value.playerLocation} with ${eventData.value.request?.items.length} items`;
			}
			case 'importRequestCreatedEvent': {
				return `New import request for ${eventData.value.playerLocation} with ${eventData.value.request?.items.length} items`;
			}
			case undefined:
				return 'An event was received without details.';
			default: {
				const exhaustiveCheck: never = eventData;
				return exhaustiveCheck;
			}
		}
	};
</script>

<Card class="w-full" title="EventLog">
	<List class="max-h-80 overflow-y-auto">
		{#each events as e}
			<ListElement>{eventText(e)}</ListElement>
		{/each}
	</List>
</Card>
