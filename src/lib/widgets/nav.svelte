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

<nav class="nav">
	<p class="nav-title">Character</p>
	<ul class="nav-list">
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
	<p class="nav-title">
		<span>{navIcons.jobs}</span> Jobs
	</p>
	<ul class="nav-list">
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
	.nav {
		float: left;
		width: 12rem; /* w-48 */
		height: 100vh; /* h-screen */
		padding: 1rem; /* p-4 */
		margin-left: 1rem; /* mx-4 */
		margin-right: 1rem; /* mx-4 */
		background-color: #eff6ff; /* bg-blue-50 */
		border-radius: 0.75rem; /* rounded-xl */
	}
	.nav-title {
		font-size: 1.5rem; /* text-2xl */
		line-height: 2rem;
		font-weight: 700; /* font-bold */
		color: #1d4ed8; /* text-blue-700 */
		display: flex;
		align-items: center;
		gap: 0.5rem; /* gap-2 */
		margin-bottom: 0.5rem; /* mb-2 */
	}
	.nav-list {
		margin-bottom: 1.5rem; /* mb-6 */
	}
	.active {
		background-color: #bfdbfe; /* bg-blue-200 */
		color: #2563eb; /* text-blue-600 */
	}

	.nav-header {
		font-size: 1.125rem; /* text-lg */
		line-height: 1.75rem;
		font-weight: 600; /* font-semibold */
		color: #2563eb; /* text-blue-600 */
		margin-top: 0.5rem; /* mt-2 */
		margin-bottom: 0.25rem; /* mb-1 */
	}
	.nav-item {
		border-radius: 0.5rem; /* rounded-lg */
		transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 150ms;
	}
	.nav-item:hover {
		background-color: #bfdbfe; /* bg-blue-200 */
	}
	.nav-content {
		padding: 0.5rem; /* p-2 */
		display: flex;
		align-items: center;
		gap: 0.5rem; /* gap-2 */
	}
</style>
