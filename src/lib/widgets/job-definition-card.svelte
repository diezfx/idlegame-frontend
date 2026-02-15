<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import { cn } from '$lib/utils';
	import { protoToMilliseconds } from '$lib/utils/prototime';
	import { Duration } from 'luxon';
	import type { SvelteMap } from 'svelte/reactivity';
	import type { ItemDefinition, JobSubType } from '../../gen/v1/masterdata_pb';
	import { JobSubType as JobSubTypeEnum } from '../../gen/v1/masterdata_pb';
	import type { BattleJobInfo, ProductionJobInfo } from '../../gen/v1/service_pb';
	import {
		Cog,
		Factory,
		Fish,
		Flame,
		FlaskConical,
		Footprints,
		Hammer,
		Shield,
		Soup,
		Swords,
		TreePine,
		Wheat,
	} from 'lucide-svelte';

	type JobCardData = {
		definition?: ProductionJobInfo['definition'] | BattleJobInfo['definition'];
		routeInfo?: ProductionJobInfo['routeInfo'] | BattleJobInfo['routeInfo'];
	};
	type VisualConfig = {
		icon: any;
		chip: string;
		chipClass: string;
		iconClass: string;
		highlightClass: string;
		selectedClass: string;
		hoverClass: string;
	};

	let {
		job,
		selected = false,
		interactive = true,
		itemDefs,
		onclick,
		class: className,
	}: {
		job: JobCardData;
		selected?: boolean;
		interactive?: boolean;
		itemDefs?: SvelteMap<string, ItemDefinition>;
		onclick?: () => void;
		class?: string;
	} = $props();

	const subtype = $derived(job.definition?.subType ?? JobSubTypeEnum.UNSPECIFIED);
	const visual = $derived(visualForSubtype(subtype));
	const ingredients = $derived.by(() => {
		const definition = job.definition as { ingredients?: { id: string; quantity: bigint }[] } | undefined;
		return definition?.ingredients ?? [];
	});

	function visualForSubtype(subType: JobSubType): VisualConfig {
		if (subType === JobSubTypeEnum.WOODCUTTING || subType === JobSubTypeEnum.WOODWORKING) {
			return {
				icon: TreePine,
				chip: 'WOOD',
				chipClass: 'bg-emerald-600 text-white',
				iconClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
				highlightClass: 'ring-1 ring-emerald-200/80',
				selectedClass: 'ring-2 ring-emerald-300 bg-emerald-50/40 border-emerald-200',
				hoverClass: 'hover:border-emerald-200 hover:shadow-md',
			};
		}
		if (
			subType === JobSubTypeEnum.SMELTING ||
			subType === JobSubTypeEnum.WEAPON_CRAFTING ||
			subType === JobSubTypeEnum.ARMOR_CRAFTING
		) {
			return {
				icon: subType === JobSubTypeEnum.ARMOR_CRAFTING ? Shield : Hammer,
				chip: subType === JobSubTypeEnum.ARMOR_CRAFTING ? 'ARMOR' : 'METAL',
				chipClass: 'bg-slate-700 text-white',
				iconClass: 'bg-slate-100 text-slate-700 border-slate-200',
				highlightClass: '',
				selectedClass: 'ring-2 ring-slate-300 bg-slate-50 border-slate-200',
				hoverClass: 'hover:border-slate-200 hover:shadow-md',
			};
		}
		if (subType === JobSubTypeEnum.FOOD_PROCESSING || subType === JobSubTypeEnum.COOKING) {
			return {
				icon: Soup,
				chip: 'FOOD',
				chipClass: 'bg-orange-600 text-white',
				iconClass: 'bg-orange-100 text-orange-700 border-orange-200',
				highlightClass: '',
				selectedClass: 'ring-2 ring-orange-300 bg-orange-50 border-orange-200',
				hoverClass: 'hover:border-orange-200 hover:shadow-md',
			};
		}
		if (subType === JobSubTypeEnum.HARVESTING || subType === JobSubTypeEnum.FISHERY) {
			return {
				icon: FlaskConical,
				chip: 'MATERIAL',
				chipClass: 'bg-cyan-700 text-white',
				iconClass: 'bg-cyan-100 text-cyan-700 border-cyan-200',
				highlightClass: '',
				selectedClass: 'ring-2 ring-cyan-300 bg-cyan-50 border-cyan-200',
				hoverClass: 'hover:border-cyan-200 hover:shadow-md',
			};
		}
		if (subType === JobSubTypeEnum.MINING) {
			return {
				icon: Hammer,
				chip: 'MINING',
				chipClass: 'bg-zinc-700 text-white',
				iconClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
				highlightClass: '',
				selectedClass: 'ring-2 ring-zinc-300 bg-zinc-50 border-zinc-200',
				hoverClass: 'hover:border-zinc-200 hover:shadow-md',
			};
		}
		if (subType === JobSubTypeEnum.FISHING) {
			return {
				icon: Fish,
				chip: 'FISHING',
				chipClass: 'bg-sky-700 text-white',
				iconClass: 'bg-sky-100 text-sky-700 border-sky-200',
				highlightClass: '',
				selectedClass: 'ring-2 ring-sky-300 bg-sky-50 border-sky-200',
				hoverClass: 'hover:border-sky-200 hover:shadow-md',
			};
		}
		if (subType === JobSubTypeEnum.BATTLE) {
			return {
				icon: Swords,
				chip: 'BATTLE',
				chipClass: 'bg-red-600 text-white',
				iconClass: 'bg-red-100 text-red-700 border-red-200',
				highlightClass: '',
				selectedClass: 'ring-2 ring-red-300 bg-red-50/40 border-red-200',
				hoverClass: 'hover:border-red-200 hover:shadow-md',
			};
		}
		return {
			icon: subtype === JobSubTypeEnum.UNSPECIFIED ? Factory : Cog,
			chip: 'PROCESS',
			chipClass: 'bg-gray-700 text-white',
			iconClass: 'bg-gray-100 text-gray-700 border-gray-200',
			highlightClass: '',
			selectedClass: 'ring-2 ring-gray-300 bg-gray-50 border-gray-200',
			hoverClass: 'hover:border-gray-200 hover:shadow-md',
		};
	}

	function rewardLabel(id: string): string {
		return itemDefs?.get(id)?.name ?? id;
	}
</script>

<Card
	{onclick}
	class={cn(
		'w-full border transition-all duration-150',
		visual.highlightClass,
		selected ? visual.selectedClass : interactive ? visual.hoverClass : '',
		interactive ? 'cursor-pointer' : '',
		className,
	)}
>
	<div class="space-y-3">
		<div class="flex items-center justify-between gap-2">
			<div class="flex items-center gap-2 min-w-0">
				<span class="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md border {visual.iconClass}">
					<visual.icon size={16} />
				</span>
				<div class="truncate font-semibold tracking-tight text-gray-900">{job.definition?.id}</div>
			</div>
			<span class="rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide {visual.chipClass}">{visual.chip}</span>
		</div>

		<div class="grid grid-cols-2 gap-2 text-sm">
			<div class="rounded-md border border-gray-200 bg-white px-2 py-1.5">
				<div class="text-[11px] uppercase text-gray-500">Required Lv</div>
				<div class="font-semibold">{job.definition?.levelRequirement}</div>
			</div>
			<div class="rounded-md border border-gray-200 bg-white px-2 py-1.5">
				<div class="text-[11px] uppercase text-gray-500">Stamina</div>
				<div class="font-semibold">{job.definition?.staminaCost}</div>
			</div>
			{#if job.definition?.duration}
				<div class="rounded-md border border-gray-200 bg-white px-2 py-1.5">
					<div class="text-[11px] uppercase text-gray-500">Duration</div>
					<div class="font-semibold">
						{Duration.fromMillis(protoToMilliseconds(job.definition.duration))
							.shiftTo('seconds')
							.toHuman({ unitDisplay: 'narrow' })}
					</div>
				</div>
			{/if}
		</div>

		<div class="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-700">
			<span class="inline-flex items-center gap-1"><Footprints size={13} /> Travel</span>
			<span class="text-right">
				<span class="font-medium">{Math.round((job.routeInfo?.distance ?? 0) * 100) / 100}m</span>
				<span class="mx-1 text-gray-400">/</span>
				<span>
					{Duration.fromMillis(protoToMilliseconds(job.routeInfo?.estimatedDuration))
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
					<span class="rounded bg-emerald-100 px-1 py-0.5 text-[10px]">+{job.definition?.rewards?.experience ?? 0}</span>
				</span>
				{#each job.definition?.rewards?.items ?? [] as rewardItem}
					<span class="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs">
						<span class="font-medium">{rewardLabel(rewardItem.id)}</span>
						<span class="rounded bg-gray-100 px-1 py-0.5 text-[10px]">x{rewardItem.quantity}</span>
					</span>
				{/each}
			</div>
		</div>

		{#if ingredients.length}
			<div class="space-y-1.5">
				<div class="text-xs font-semibold uppercase tracking-wider text-gray-600">Ingredients</div>
				<div class="flex flex-wrap gap-1.5">
					{#each ingredients as ingredient}
						<span class="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs">
							<span class="font-medium">{rewardLabel(ingredient.id)}</span>
							<span class="rounded bg-gray-100 px-1 py-0.5 text-[10px]">x{ingredient.quantity}</span>
						</span>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</Card>
