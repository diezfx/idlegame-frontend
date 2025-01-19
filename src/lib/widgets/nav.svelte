<script lang="ts">
	import { page } from '$app/stores';

	function activeClass(url: string): string {
		const activeColor = 'bg-blue-400';
		const isActive = url === $page.url.pathname;
		if (isActive) {
			return activeColor;
		}
		return '';
	}
</script>

<nav class="float-left w-40 h-screen p-4 mx-4 bg-blue-50">
	<p class="text-2xl">Character</p>
	<ul>
		<li class="outline p-4 mt-2 outline-gray-200 {activeClass('/jobs')}">
			<a href="/jobs">Jobs</a>
		</li>
		<li class="outline p-4 mt-2 outline-gray-200 {activeClass('/monsters')}">
			<a href="/monsters">Monsters</a>
		</li>
		<li class="outline p-4 mt-2 outline-gray-200 {activeClass('/inventory')}">
			<a href="/inventory">Inventory</a>
		</li>
	</ul>
	<p class="mt-4 text-2xl">Jobs</p>
	<ul>
		<p class="text-xl">Gathering</p>
		<li class="outline p-4 mt-2 outline-gray-200 {activeClass('/jobs/gathering/woodcutting')}">
			<a href="/jobs/gathering/woodcutting">Woodcutting</a>
		</li>
		<li class="outline p-4 mt-2 outline-gray-200 {activeClass('/mining')}">
			<a href="/jobs/gathering/mining">Mining</a>
		</li>
		<p class="text-xl">Processing</p>
		<li class="outline p-4 mt-2 outline-gray-200 {activeClass('/jobs/processing/smelting')}">
			<a href="/jobs/processing/smelting">Smelting</a>
		</li>
		<li class="outline p-4 mt-2 outline-gray-200 {activeClass('/jobs/processing/woodworking')}">
			<a href="/jobs/processing/woodworking">Woodworking</a>
		</li>
	</ul>
</nav>
