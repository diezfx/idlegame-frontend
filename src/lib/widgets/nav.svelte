<script lang="ts">
	import { page } from '$app/stores';
	import { JobSubType } from '../../gen/v1/masterdata_pb';

	function activeClass(url: string): string {
		const isActive = url === $page.url.pathname;
		if (isActive) {
			return 'active';
		}
		return '';
	}

	const navIcons = {
		jobs: '💼',
		monsters: '👾',
		inventory: '🎒',
		woodcutting: '🌲',
		mining: '⛏️',
		harvesting: '🌾',
		fishing: '🎣',
		smelting: '🔥',
		woodworking: '🪓',
		foodProcessing: '🍲',
		fishery: '🐟',
		battles: '⚔️',
		map: '🗺️',
	};
</script>

<nav class="sticky top-0 h-screen w-48 flex-none rounded-xl bg-sidebar p-4 mx-4 overflow-y-auto">
	<p class="mb-2 flex items-center gap-2 text-2xl font-bold">Character</p>
	<ul class="mb-6">
		<li class="nav-item {activeClass('/jobs')}">
			<a class="nav-content" href="/jobs"> Jobs</a>
		</li>
		<li class="nav-item {activeClass('/monsters')}">
			<a class="nav-content" href="/monsters">{navIcons.monsters} Monsters</a>
		</li>
		<li class="nav-item {activeClass('/inventory')}">
			<a class="nav-content" href="/inventory">{navIcons.inventory} Inventory</a>
		</li>
		<li class="nav-item {activeClass('/map')}">
			<a class="nav-content" href="/map">{navIcons.map} Map</a>
		</li>
	</ul>
	<p class="mt-2 flex items-center gap-2 text-2xl font-bold text-primary">
		<span>{navIcons.jobs}</span> Jobs
	</p>
	<ul class="mt-2">
		<p class="nav-header">Gathering</p>
		<li class="nav-item {activeClass(`/jobs/processing/${JobSubType.WOODCUTTING}`)}">
			<a class="nav-content" href="/jobs/processing/{JobSubType.WOODCUTTING}">{navIcons.woodcutting} Woodcutting</a>
		</li>
		<li class="nav-item {activeClass(`/jobs/processing/${JobSubType.MINING}`)}">
			<a class="nav-content" href="/jobs/processing/{JobSubType.MINING}">{navIcons.mining} Mining</a>
		</li>
		<li class="nav-item {activeClass(`/jobs/processing/${JobSubType.HARVESTING}`)}">
			<a class="nav-content" href="/jobs/processing/{JobSubType.HARVESTING}">{navIcons.harvesting} Harvesting</a>
		</li>
		<li class="nav-item {activeClass(`/jobs/processing/${JobSubType.FISHING}`)}">
			<a class="nav-content" href="/jobs/processing/{JobSubType.FISHING}">{navIcons.fishing} Fishing</a>
		</li>
		<p class="nav-header">Processing</p>
		<li class="nav-item {activeClass(`/jobs/processing/${JobSubType.SMELTING}`)}">
			<a class="nav-content" href="/jobs/processing/{JobSubType.SMELTING}">{navIcons.smelting} Smelting</a>
		</li>
		<li class="nav-item {activeClass(`/jobs/processing/${JobSubType.WOODWORKING}`)}">
			<a class="nav-content" href="/jobs/processing/{JobSubType.WOODWORKING}">{navIcons.woodworking} Woodworking</a>
		</li>
		<li class="nav-item {activeClass(`/jobs/processing/${JobSubType.FOOD_PROCESSING}`)}">
			<a class="nav-content" href="/jobs/processing/{JobSubType.FOOD_PROCESSING}"
				>{navIcons.foodProcessing} Processing</a
			>
		</li>
		<li class="nav-item {activeClass(`/jobs/processing/${JobSubType.FISHERY}`)}">
			<a class="nav-content" href="/jobs/processing/{JobSubType.FISHERY}">{navIcons.fishery} Fishery</a>
		</li>
		<p class="nav-header">Products</p>
		<li class="nav-item {activeClass(`/jobs/processing/${JobSubType.WEAPON_CRAFTING}`)}">
			<a class="nav-content" href="/jobs/processing/{JobSubType.WEAPON_CRAFTING}">{navIcons.smelting} Weapons</a>
		</li>
		<li class="nav-item {activeClass(`/jobs/processing/${JobSubType.ARMOR_CRAFTING}`)}">
			<a class="nav-content" href="/jobs/processing/{JobSubType.ARMOR_CRAFTING}">{navIcons.woodworking} Armour</a>
		</li>
		<li class="nav-item {activeClass(`/jobs/processing/${JobSubType.COOKING}`)}">
			<a class="nav-content" href="/jobs/processing/{JobSubType.COOKING}">{navIcons.foodProcessing} Cooking</a>
		</li>
		<p class="nav-header">Battles</p>
		<li class="nav-item {activeClass('/jobs/battles')}">
			<a class="nav-content" href="/jobs/battles">{navIcons.battles} Battles</a>
		</li>
	</ul>
</nav>

<style>
	/*
	text-lg font-semibold text-blue-600 mt-2 mb-1
	*/
	.active {
		background-color: var(--color-sidebar-primary);
		color: var(--color-sidebar-primary-foreground);
	}

	.nav-header {
		font-size: 1.125rem; /* Tailwind text-lg */
		font-weight: 600; /* Tailwind font-semibold */
		color: var(--color-primary);
		margin-top: 0.5rem; /* Tailwind mt-2 */
		margin-bottom: 0.25rem; /* Tailwind mb-1 */
	}
	.nav-item {
		border-radius: 0.5rem;
		transition: background 0.15s;
	}
	.nav-item:not(.active):hover {
		background-color: var(--color-sidebar-accent); /* Tailwind blue-200 */
	}
	.nav-content {
		padding: 0.5rem; /* Tailwind p-2 */
		display: flex;
		align-items: center;
		gap: 0.5rem; /* Tailwind gap-2 */
	}
</style>
