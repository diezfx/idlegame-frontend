<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import {
		CalendarClock,
		Skull,
		Gift,
		CirclePlay,
		CircleAlert,
		TreePine,
		Pickaxe,
		Wheat,
		Fish,
		Flame,
		Anvil,
		ChefHat,
		Swords,
		Shield,
		Truck
	} from 'lucide-svelte';

	import { DateTime } from 'luxon';
	import { protoToMilliseconds } from '$lib/utils/prototime';
	import { JobSubType } from '../../gen/v1/masterdata_pb';
	import { jobStatusText } from '$lib/utils/enumtext';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	let {
		jobID,
		onclick,
		onStop,
		...props
	}: {
		jobID: string;
		onclick?: () => void;
		onStop?: () => void;
		[key: string]: any;
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

	const job = $derived(gameStateStore.Jobs.get(jobID));
	const monsters = $derived(
		(job?.monsters ?? [])
			.map((id) => gameStateStore.Monsters.get(id))
			.filter((m): m is NonNullable<typeof m> => m != null),
	);
	const subtype = $derived(job?.def?.subType ?? JobSubType.UNSPECIFIED);

	const jobVisual = $derived.by(() => {
		switch (subtype) {
			case JobSubType.WOODCUTTING:
			case JobSubType.WOODWORKING:
				return {
					icon: TreePine,
					iconWrap: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
					highlight: 'ring-1 ring-emerald-200/70',
					chip: 'WOOD'
				};
			case JobSubType.MINING:
				return { icon: Pickaxe, iconWrap: 'bg-slate-100 text-slate-700 border border-slate-200', highlight: '', chip: null };
			case JobSubType.HARVESTING:
				return { icon: Wheat, iconWrap: 'bg-amber-100 text-amber-700 border border-amber-200', highlight: '', chip: null };
			case JobSubType.FISHING:
			case JobSubType.FISHERY:
				return { icon: Fish, iconWrap: 'bg-sky-100 text-sky-700 border border-sky-200', highlight: '', chip: null };
			case JobSubType.SMELTING:
				return { icon: Flame, iconWrap: 'bg-orange-100 text-orange-700 border border-orange-200', highlight: '', chip: null };
			case JobSubType.WEAPON_CRAFTING:
				return { icon: Swords, iconWrap: 'bg-rose-100 text-rose-700 border border-rose-200', highlight: '', chip: null };
			case JobSubType.ARMOR_CRAFTING:
				return { icon: Shield, iconWrap: 'bg-indigo-100 text-indigo-700 border border-indigo-200', highlight: '', chip: null };
			case JobSubType.COOKING:
			case JobSubType.FOOD_PROCESSING:
				return { icon: ChefHat, iconWrap: 'bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200', highlight: '', chip: null };
			case JobSubType.TRANSPORT:
				return { icon: Truck, iconWrap: 'bg-cyan-100 text-cyan-700 border border-cyan-200', highlight: '', chip: null };
			default:
				return { icon: Anvil, iconWrap: 'bg-gray-100 text-gray-700 border border-gray-200', highlight: '', chip: null };
		}
	});

	const statusColor = $derived(
		job?.jobState?.status === 1
			? 'text-yellow-600 bg-yellow-100' // In Progress (assuming 1)
			: job?.jobState?.status === 2
				? 'text-green-600 bg-green-100' // Completed (assuming 2)
				: 'text-gray-600 bg-gray-100',
	);
</script>

{#if job}
	<Card
		{onclick}
		{...props}
		class="w-[350px] shadow-lg rounded-xl border border-gray-200 bg-white hover:shadow-2xl transition-all duration-200 {jobVisual.highlight} {props.class ||
			''}"
	>
		<!-- Header -->
		<div class="p-4 border-b border-gray-100 grid grid-cols-[1fr_auto] items-center bg-gray-50/50 rounded-t-xl">
			<div class="flex flex-col">
				<div class="flex items-center gap-2">
					<span class="inline-flex h-7 w-7 items-center justify-center rounded-md {jobVisual.iconWrap}">
						<jobVisual.icon size={15} />
					</span>
					<h3 class="font-bold text-gray-800 leading-tight">{job.def?.jobDefId}</h3>
					{#if jobVisual.chip}
						<span class="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">
							{jobVisual.chip}
						</span>
					{/if}
				</div>
				<span class="mt-1 text-xs text-gray-500 capitalize">{JobSubType[job.def?.subType!]}</span>
			</div>
			{#if job?.jobState?.status}
				<span class="text-xs font-semibold px-2.5 py-1 rounded-full {statusColor} capitalize">
					{jobStatusText(job.jobState.status)}
				</span>
			{/if}
		</div>

		<div class="p-4 space-y-4">
			<!-- Monster Info -->
			<div class="grid grid-cols-[auto_1fr] gap-3 items-start">
				<div class="mt-0.5 text-gray-400">
					<Skull size={16} />
				</div>
				<div class="flex flex-col flex-1 min-w-0">
					<span class="text-xs text-gray-500 uppercase font-semibold tracking-wider">Assigned Monster</span>
					<span class="font-medium text-gray-900 truncate">{monsters.map((m) => m!.identity?.name).join?.(', ')}</span>
				</div>
			</div>

			<!-- Timestamps Grid -->
			<div class="grid grid-cols-2 gap-4">
				<div class="grid grid-cols-[auto_1fr] gap-2 items-start">
					<div class="mt-0.5 text-gray-400">
						<CirclePlay size={16} />
					</div>
					<div class="flex flex-col">
						<span class="text-xs text-gray-500 uppercase font-semibold tracking-wider">Started</span>
						<span class="text-sm text-gray-900"
							>{timeAgo(DateTime.fromMillis(protoToMilliseconds(job.entity?.createdAt!)))}</span
						>
					</div>
				</div>

				<div class="grid grid-cols-[auto_1fr] gap-2 items-start">
					<div class="mt-0.5 text-gray-400">
						<CalendarClock size={16} />
					</div>
					<div class="flex flex-col">
						<span class="text-xs text-gray-500 uppercase font-semibold tracking-wider">Updated</span>
						<span class="text-sm text-gray-900"
							>{timeAgo(DateTime.fromMillis(protoToMilliseconds(job.jobState?.updatedAt!)))}</span
						>
					</div>
				</div>
			</div>

			<!-- Rewards -->
			{#if job.rewards?.inventory?.items?.length}
				<Separator class="bg-gray-100" />
				<div>
					<div class="grid grid-flow-col justify-start items-center gap-1.5 text-xs text-gray-500 mb-2 font-medium">
						<Gift size={14} /> Rewards
					</div>
					<div class="flex flex-wrap gap-2">
						{#each job.rewards.inventory.items as reward}
							<span
								class="inline-flex items-center px-2 py-1 bg-green-50 border border-green-100 rounded-md text-green-700 text-xs font-medium"
							>
								{reward.quantity} × {reward.id}
							</span>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Action Footer -->
		<div class="p-4 bg-gray-50/50 border-t border-gray-100 rounded-b-xl flex justify-center">
			<Button
				class="w-full bg-red-500 hover:bg-red-600 text-white font-medium shadow-sm hover:shadow transition-all"
				onclick={onStop}
			>
				<CircleAlert size={16} class="mr-2" /> Stop Job
			</Button>
		</div>
	</Card>
{/if}
