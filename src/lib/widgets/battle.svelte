<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import type { Job } from '$lib/service/jobs';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import { jobStatusText } from '$lib/utils/enumtext';
	import { protoToMilliseconds } from '$lib/utils/prototime';
	import { toBattleMonsterView, type BattleMonsterView } from '$lib/views/battle';
	import type { Event, Monster } from '../../gen/v1/domain_pb';
	import { Role } from '../../gen/v1/domain_pb';
	import {
		CircleDot,
		Clock3,
		ScrollText,
		Shield,
		Timer,
	} from 'lucide-svelte';

	let { job }: { job: Job; [key: string]: any } = $props();

	let animationFrameId: number | undefined;
	let nowMs = $state(Date.now());
	let stopping = $state(false);

	const monsters = $derived(
		job.monsters.map((id) => gameStateStore.Monsters.get(id)).filter((m): m is Monster => m != null),
	);
	const playerMonsters = $derived(monsters.filter((m) => m.participant?.role === Role.PLAYER));
	const enemyMonsters = $derived(monsters.filter((m) => m.participant?.role === Role.ENEMY));
	const playerBattleMonsters = $derived(playerMonsters.map((m) => toBattleMonsterView(m, nowMs)));
	const enemyBattleMonsters = $derived(enemyMonsters.map((m) => toBattleMonsterView(m, nowMs)));
	const nameByEntityId = $derived.by(() => {
		const map = new Map<string, string>();
		for (const mon of monsters) {
			if (!mon.entity?.id) continue;
			map.set(mon.entity.id, mon.identity?.name || mon.entity.id.slice(0, 8));
		}
		return map;
	});

	const startedAtMs = $derived(job.entity?.createdAt ? protoToMilliseconds(job.entity.createdAt) : nowMs);
	const elapsedSeconds = $derived(Math.max(0, Math.floor((nowMs - startedAtMs) / 1000)));
	const elapsedText = $derived(formatDuration(elapsedSeconds));

	const recentEvents = $derived.by(() => {
		const streamEvents = gameStateStore.Events.filter((event) => event.eventContext?.jobId === job.entity?.id);
		const source = streamEvents.length > 0 ? streamEvents : (job.events ?? []);
		return [...source]
			.sort((a, b) => {
				const aMs = a.timestamp ? protoToMilliseconds(a.timestamp) : 0;
				const bMs = b.timestamp ? protoToMilliseconds(b.timestamp) : 0;
				return bMs - aMs;
			})
			.slice(0, 10);
	});

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

	function formatDuration(totalSeconds: number): string {
		const mins = Math.floor(totalSeconds / 60);
		const secs = totalSeconds % 60;
		if (mins === 0) return `${secs}s`;
		return `${mins}m ${secs.toString().padStart(2, '0')}s`;
	}

	function timeAgo(ms: number): string {
		const seconds = Math.max(0, Math.floor((nowMs - ms) / 1000));
		if (seconds < 60) return `${seconds}s ago`;
		const mins = Math.floor(seconds / 60);
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.floor(mins / 60);
		return `${hours}h ago`;
	}

	function shortId(id: string): string {
		return id.slice(0, 8);
	}

	function nameForEntity(id: string): string {
		return nameByEntityId.get(id) ?? shortId(id);
	}

	function eventText(event: Event): string {
		const oneof = event.eventData as { case?: string; value?: any } | undefined;
		if (!oneof?.case) return event.eventType || 'Event';
		switch (oneof.case) {
			case 'attackEvent': {
				const ev = oneof.value;
				return `${nameForEntity(ev.attacker)} hit ${nameForEntity(ev.target)} for ${ev.damage}`;
			}
			case 'defeatedEnemiesEvent': {
				const ev = oneof.value;
				const xp = ev.rewards?.experience ?? 0;
				return `Wave cleared (+${xp} XP)`;
			}
			case 'nextRoundEnemiesEvent': {
				const ev = oneof.value;
				return `New enemy wave (${ev.enemies?.length ?? 0})`;
			}
			case 'consumeItemEvent': {
				const ev = oneof.value;
				return `${nameForEntity(ev.monsterId)} used ${ev.itemDefId}`;
			}
			case 'stopWorkingEvent':
				return 'Battle ended, returning';
			case 'arriveEvent':
				return 'Team reached battle location';
			case 'jobStartedEvent':
				return 'Battle started';
			default:
				return event.eventType || oneof.case;
		}
	}

	function eventTime(event: Event): string {
		if (!event.timestamp) return '--';
		return timeAgo(protoToMilliseconds(event.timestamp));
	}

	function hpPercent(mon: Monster): number {
		const hp = mon.stat?.health ?? 0;
		const max = mon.stat?.maxHealth ?? 1;
		return Math.max(0, Math.min(100, (hp / max) * 100));
	}

	function isAlive(mon: Monster): boolean {
		return (mon.stat?.health ?? 0) > 0;
	}

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
</script>

<div class="space-y-4">
	<header class="sticky top-0 z-20 rounded-xl border border-gray-200 bg-white/95 p-3 backdrop-blur">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<div class="text-xs font-semibold uppercase tracking-wider text-gray-500">Battle</div>
				<h1 class="text-xl font-bold text-gray-900">{job.def?.jobDefId}</h1>
			</div>
			<div class="flex items-center gap-2 text-sm">
				<span class="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-gray-700">{jobStatusText(job.jobState?.status!)}</span>
				<span class="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-gray-700">
					<Timer size={14} /> {elapsedText}
				</span>
				<Button class="bg-red-600 text-white hover:bg-red-700" onclick={stopBattle} disabled={stopping}>
					{stopping ? 'Stopping...' : 'Stop'}
				</Button>
			</div>
		</div>
		<div class="mt-2 flex flex-wrap gap-1.5 text-xs">
			<span class="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-800">
				<Shield size={12} /> XP +{job.rewards?.experience ?? 0}
			</span>
			{#each job.rewards?.inventory?.items ?? [] as reward}
				<span class="rounded border border-gray-200 bg-white px-2 py-1">{reward.id} x{reward.quantity}</span>
			{/each}
		</div>
	</header>

	<div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
		<section class="rounded-xl border border-gray-200 bg-white p-3">
			<div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-start">
				<div>
					<div class="mb-2 flex items-center justify-between">
						<h2 class="text-sm font-semibold text-gray-900">Your Team</h2>
					</div>
					<div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
						{#each playerBattleMonsters as view (view.monster.entity?.id)}
							{@const mon = view.monster}
							<Card class="border {isAlive(mon) ? 'border-emerald-200' : 'border-gray-300 opacity-60'} p-2">
								<div class="mb-1 flex items-center justify-between gap-2">
									<div class="truncate text-sm font-semibold text-gray-900">{mon.identity?.name}</div>
								</div>
								<div class="mb-1 text-[11px] text-gray-600">HP {(mon.stat?.health ?? 0)}/{mon.stat?.maxHealth ?? 0}</div>
								<Progress foreground="bg-red-500" background="bg-gray-200" value={mon.stat?.health ?? 0} max={mon.stat?.maxHealth ?? 1} />
								<div class="mt-2 flex items-center gap-1 text-[10px] text-gray-600">
									<CircleDot size={12} /> ATK {mon.stat?.attackPower ?? 0} | LV {mon.stat?.level ?? 0}
								</div>
								<div class="mt-1 grid grid-cols-4 gap-1 text-[10px] text-gray-600">
									<span class="rounded bg-red-50 px-1 py-0.5 text-center">STR {mon.stat?.strength ?? 0}</span>
									<span class="rounded bg-amber-50 px-1 py-0.5 text-center">AGI {mon.stat?.agility ?? 0}</span>
									<span class="rounded bg-blue-50 px-1 py-0.5 text-center">INT {mon.stat?.intelligence ?? 0}</span>
									<span class="rounded bg-emerald-50 px-1 py-0.5 text-center">VIT {mon.stat?.vitality ?? 0}</span>
								</div>
								<div class="mt-1">
									<Progress transition={false} foreground="bg-blue-300" background="bg-gray-200" value={view.attackElapsedMs} max={view.attackCooldownMs || 1} />
								</div>
							</Card>
						{/each}
					</div>
				</div>

				<div class="hidden md:flex h-full items-center justify-center px-2">
					<div class="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold tracking-widest text-red-700">VS</div>
				</div>

				<div>
					<div class="mb-2 flex items-center justify-between">
						<h2 class="text-sm font-semibold text-gray-900">Enemies</h2>
					</div>
					<div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
						{#each enemyBattleMonsters as view (view.monster.entity?.id)}
							{@const mon = view.monster}
							<Card class="border {isAlive(mon) ? 'border-red-200' : 'border-gray-300 opacity-60'} p-2">
								<div class="mb-1 flex items-center justify-between gap-2">
									<div class="truncate text-sm font-semibold text-gray-900">{mon.identity?.name}</div>
								</div>
								<div class="mb-1 text-[11px] text-gray-600">HP {(mon.stat?.health ?? 0)}/{mon.stat?.maxHealth ?? 0}</div>
								<Progress foreground="bg-red-500" background="bg-gray-200" value={mon.stat?.health ?? 0} max={mon.stat?.maxHealth ?? 1} />
								<div class="mt-2 flex items-center gap-1 text-[10px] text-gray-600">
									<CircleDot size={12} /> ATK {mon.stat?.attackPower ?? 0} | HP {Math.round(hpPercent(mon))}%
								</div>
								<div class="mt-1 grid grid-cols-4 gap-1 text-[10px] text-gray-600">
									<span class="rounded bg-red-50 px-1 py-0.5 text-center">STR {mon.stat?.strength ?? 0}</span>
									<span class="rounded bg-amber-50 px-1 py-0.5 text-center">AGI {mon.stat?.agility ?? 0}</span>
									<span class="rounded bg-blue-50 px-1 py-0.5 text-center">INT {mon.stat?.intelligence ?? 0}</span>
									<span class="rounded bg-emerald-50 px-1 py-0.5 text-center">VIT {mon.stat?.vitality ?? 0}</span>
								</div>
								<div class="mt-1">
									<Progress transition={false} foreground="bg-blue-300" background="bg-gray-200" value={view.attackElapsedMs} max={view.attackCooldownMs || 1} />
								</div>
							</Card>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<aside class="rounded-xl border border-gray-200 bg-white p-3">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="inline-flex items-center gap-1 text-sm font-semibold text-gray-900"><ScrollText size={14} /> Combat Log</h3>
				<span class="text-xs text-gray-500">Last 10</span>
			</div>
			<div class="max-h-[55vh] space-y-1 overflow-y-auto pr-1">
				{#if recentEvents.length === 0}
					<div class="rounded border border-dashed border-gray-300 bg-gray-50 px-2 py-2 text-xs text-gray-500">No events yet</div>
				{:else}
					{#each recentEvents as event}
						<div class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5">
							<div class="text-xs text-gray-800">{eventText(event)}</div>
							<div class="mt-0.5 inline-flex items-center gap-1 text-[10px] text-gray-500"><Clock3 size={10} /> {eventTime(event)}</div>
						</div>
					{/each}
				{/if}
			</div>
		</aside>
	</div>
</div>
