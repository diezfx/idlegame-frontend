<script lang="ts">
	import { Sword } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { Monster } from '$lib/service/monsters';
	import { Button } from '$lib/components/ui/button';

	let { monsters = [], ...props }: { monsters: Monster[]; [key: string]: any } = $props();
	const TILE_SIZE = 10;

	onMount(async () => {
		const PIXI = await import('pixi.js');
		const response = await fetch('/assets/map.json');
		const mapData = await response.json();

		const app = new PIXI.Application();
		await app.init({ width: 1000, height: 1000 });

		const mapContainer = document.getElementById('map-container');
		if (mapContainer) {
			// Prepend the canvas to ensure the overlay is on top.
			mapContainer.prepend(app.canvas);
		}

		const textures = await Promise.all(mapData.tileSet.map((tile: any) => PIXI.Assets.load(`/assets/${tile.source}`)));

		for (let y = 0; y < mapData.height; y++) {
			for (let x = 0; x < mapData.width; x++) {
				const tileId = mapData.layer[y][x];
				const tileInfo = mapData.tileSet.find((t: any) => t.tileSetId === tileId);
				if (tileInfo) {
					const texture = textures[mapData.tileSet.indexOf(tileInfo)];
					const sprite = new PIXI.Sprite(texture);
					sprite.width = TILE_SIZE;
					sprite.height = TILE_SIZE;
					sprite.x = x * TILE_SIZE;
					sprite.y = y * TILE_SIZE;
					app.stage.addChild(sprite);
				}
			}
		}
	});
</script>

<div id="map-container" class="relative w-[1000px] h-[1000px]">
	<div class="absolute top-0 left-0">
		{#each monsters as monster}
			<div
				class="absolute"
				style="left: {monster.position.x * TILE_SIZE}px; top: {monster.position.y * TILE_SIZE}px;"
			>
				<Button variant="outline" size="icon" class="relative rounded-full">
					<Sword class="h-4 w-4" />
					<span
						class="absolute left-1/2 -translate-x-1/2 -top-8 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
					>
						{monster.name}
					</span>
				</Button>
			</div>
		{/each}
	</div>
</div>
