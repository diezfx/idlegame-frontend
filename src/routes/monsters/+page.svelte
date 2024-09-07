<script lang="ts">
	import type { Monster } from '$lib/service/monsters';
	import MonsterView from '$lib/widgets/monster.svelte';

	export let data: { monsters: Monster[] };
</script>

<h1>Monsters</h1>
<div class="grid grid-cols-3 gap-4">
	{#each data.monsters as monster}
		<MonsterView {monster} />
	{/each}
</div>
