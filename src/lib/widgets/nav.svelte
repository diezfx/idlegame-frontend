<script lang="ts">
	import { page } from '$app/state';

	function activeClass(url: string): string {
		const isActive = url === page.url.pathname;
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

<nav class="float-left w-48 h-screen p-4 mx-4 bg-blue-50 rounded-xl">
	<p class="text-2xl font-bold text-blue-700 flex items-center gap-2 mb-2">Character</p>
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
	<p class="mt-2 text-2xl font-bold text-blue-700 flex items-center gap-2">
		<span>{navIcons.jobs}</span> Jobs
	</p>
	<ul class="mt-2">
		<p class="nav-header">Gathering</p>
		<li class="nav-item {activeClass('/jobs/gathering/woodcutting')}">
			<a class="nav-content" href="/jobs/gathering/woodcutting">{navIcons.woodcutting} Woodcutting</a>
		</li>
		<li class="nav-item {activeClass('/jobs/gathering/mining')}">
			<a class="nav-content" href="/jobs/gathering/mining">{navIcons.mining} Mining</a>
		</li>
		<li class="nav-item {activeClass('/jobs/gathering/harvesting')}">
			<a class="nav-content" href="/jobs/gathering/harvesting">{navIcons.harvesting} Harvesting</a>
		</li>
		<li class="nav-item {activeClass('/jobs/gathering/fishing')}">
			<a class="nav-content" href="/jobs/gathering/fishing">{navIcons.fishing} Fishing</a>
		</li>
		<p class="nav-header">Processing</p>
		<li class="nav-item {activeClass('/jobs/processing/smelting')}">
			<a class="nav-content" href="/jobs/processing/smelting">{navIcons.smelting} Smelting</a>
		</li>
		<li class="nav-item {activeClass('/jobs/processing/woodworking')}">
			<a class="nav-content" href="/jobs/processing/woodworking">{navIcons.woodworking} Woodworking</a>
		</li>
		<li class="nav-item {activeClass('/jobs/processing/foodProcessing')}">
			<a class="nav-content" href="/jobs/processing/foodProcessing">{navIcons.foodProcessing} Processing</a>
		</li>
		<li class="nav-item {activeClass('/jobs/processing/fishery')}">
			<a class="nav-content" href="/jobs/processing/fishery">{navIcons.fishery} Fishery</a>
		</li>
		<p class="nav-header">Products</p>
		<li class="nav-item {activeClass('/jobs/processing/weaponCrafting')}">
			<a class="nav-content" href="/jobs/processing/weaponCrafting">{navIcons.smelting} Weapons</a>
		</li>
		<li class="nav-item {activeClass('/jobs/processing/armorCrafting')}">
			<a class="nav-content" href="/jobs/processing/armorCrafting">{navIcons.woodworking} Armour</a>
		</li>
		<li class="nav-item {activeClass('/jobs/processing/cooking')}">
			<a class="nav-content" href="/jobs/processing/cooking">{navIcons.foodProcessing} Cooking</a>
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
		background-color: #bfdbfe; /* Tailwind blue-200 */
		color: #2563eb; /* Tailwind blue-600 */
	}

	.nav-header {
		font-size: 1.125rem; /* Tailwind text-lg */
		font-weight: 600; /* Tailwind font-semibold */
		color: #2563eb; /* Tailwind blue-600 */
		margin-top: 0.5rem; /* Tailwind mt-2 */
		margin-bottom: 0.25rem; /* Tailwind mb-1 */
	}
	.nav-item {
		border-radius: 0.5rem;
		transition: background 0.15s;
	}
	.nav-item:hover {
		background-color: #bfdbfe; /* Tailwind blue-200 */
	}
	.nav-content {
		padding: 0.5rem; /* Tailwind p-2 */
		display: flex;
		align-items: center;
		gap: 0.5rem; /* Tailwind gap-2 */
	}
</style>
