<script>
	import { onMount } from 'svelte';

	// Declare WASM functions on the window object
	declare global {
		interface Window {
			Go?: any;
			loadMonster?: (monsterJson: string) => void;
			applyEvents?: (eventsJson: string) => void;
		}
	}

	let loaded = false;
	let status = 'Loading...';
	let output = '';

	onMount(async () => {
		try {
			if (!window.Go) {
				status = 'Waiting for wasm_exec.js...';
				// Simple polling if script is loaded via head
				while (!window.Go) {
					await new Promise((r) => setTimeout(r, 100));
				}
			}

			const go = new window.Go();
			const result = await WebAssembly.instantiateStreaming(fetch('/domain.wasm'), go.importObject);
			go.run(result.instance);

			loaded = true;
			status = 'WASM Loaded';
			output = "WASM initialized. Functions 'applyEvents' and 'loadMonsters' should be available.";
		} catch (e) {
			console.error(e);
			status = 'Error: ' + e.message;
		}
	});

	function testLoadMonsters() {
		if (window.loadMonster) {
			// Test with sample monster data in protobuf JSON format
			const sampleMonsterJson =
				'{"entity":{"id":"test-monster-1","entityType":"MONSTER"},"identity":{"name":"Test Monster","definitionId":"monster-1"},"stat":{"elements":0,"experience":0,"health":100,"maxHealth":100,"stamina":50,"maxStamina":50,"attackPower":10}}';
			window.loadMonster(sampleMonsterJson);
			output = 'Called loadMonster with sample monster data';
		} else {
			output = 'loadMonster function not found on window object.';
		}
	}
</script>

<svelte:head>
	<script src="/wasm_exec.js"></script>
</svelte:head>

<div class="p-4">
	<h1 class="text-2xl font-bold mb-4">Hello World WASM</h1>

	<div class="mb-4">
		<p>Status: <span class={loaded ? 'text-green-600 font-bold' : 'text-yellow-600'}>{status}</span></p>
	</div>

	<button
		class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
		on:click={testLoadMonsters}
		disabled={!loaded}
	>
		Call loadMonsters
	</button>

	<div class="mt-4 p-4 bg-gray-100 rounded border border-gray-300 font-mono">
		{output}
	</div>
</div>
