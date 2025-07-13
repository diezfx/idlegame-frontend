<script lang="ts">
	import { onMount } from 'svelte';
	import type { Monster } from '$lib/service/monsters';

	let { monsters, ...props }: { monsters: Monster[]; [key: string]: any } = $props();

	onMount(async () => {
		const PIXI = await import('pixi.js');
		const response = await fetch('/assets/map.json');
		const mapData = await response.json();

		const app = new PIXI.Application();
		await app.init({ width: 1000, height: 1000 });

		document.getElementById('map-container')?.appendChild(app.canvas);

		const textures = await Promise.all(mapData.tileSet.map((tile: any) => PIXI.Assets.load(`/assets/${tile.source}`)));

		const TILE_SIZE = 10;

		for (let y = 0; y < mapData.height; y++) {
			for (let x = 0; x < mapData.width; x++) {
				const tileId = mapData.layer[y][x];
				const tileInfo = mapData.tileSet.find((t: any) => t.tileSetId === tileId);
				console.log(tileInfo);
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
		for (const mon of monsters) {
		}
	});
</script>

<div id="map-container"></div>
