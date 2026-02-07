import { SvelteMap } from 'svelte/reactivity';

import type { Inventory, Job, Monster as MonsterType } from '../../gen/v1/domain_pb';
import { MonsterSchema } from '../../gen/v1/domain_pb';
import { clients } from '$lib/service/connect';
import { userStore } from './user.svelte';
import { Code, ConnectError } from '@connectrpc/connect';
import { toJsonString } from '@bufbuild/protobuf';

// Declare WASM functions on the window object
declare global {
	interface Window {
		loadMonster?: (monsterJson: string) => void;
		applyEvents?: (eventsJson: string) => void;
		Go?: any;
	}
}

export class GameStateStore {
	Monsters: SvelteMap<string, MonsterType>;
	Jobs: SvelteMap<string, Job>;
	Inventories: SvelteMap<string, Inventory>;
	constructor() {
		this.Monsters = new SvelteMap<string, MonsterType>();
		this.Jobs = new SvelteMap<string, Job>();
		this.Inventories = new SvelteMap<string, Inventory>();
	}

	async getMonsters(): Promise<SvelteMap<string, MonsterType>> {
		//for now always refresh until we have events
		const monsters = await clients.monsterClient.listMonsters({ ownerId: userStore.getUser().userId! });
		for (const monster of monsters.monsters) {
			if (monster.entity?.id) {
				this.Monsters.set(monster.entity.id, monster);
				// Send monster data to WASM in protobuf JSON format if the function exists
				if (typeof window.loadMonster === 'function') {
					const monsterJson = toJsonString(MonsterSchema, monster);
					console.log("load monster", monsterJson)
					window.loadMonster(monsterJson);
				}
			}
		}

		return this.Monsters;
	}

	async getJob(id: string): Promise<Job> {
		if (!this.Jobs.has(id)) {
			try {
				const job = await clients.jobClient.getJob({ id: id });
				if (job.entity?.id) {
					this.Jobs.set(job.entity.id, job);
				}
				return job;
			} catch (e) {
				if (e instanceof ConnectError && e.code == Code.NotFound) {
					throw 'job not found';
				}
				throw e;
			}
		}
		return this.Jobs.get(id)!;
	}

	async getMonster(id: string): Promise<MonsterType> {
		try {
			if (!this.Monsters.has(id)) {
				const mon = await clients.monsterClient.getMonster({ id: id });
				if (mon.entity?.id) {
					this.Monsters.set(mon.entity.id, mon);
				}
				return mon;
			}
		} catch (e) {
			if (e instanceof ConnectError && e.code == Code.NotFound) {
				throw 'monster not found';
			}
			throw e;
		}
		return this.Monsters.get(id)!;
	}

	async getJobs(): Promise<SvelteMap<string, Job>> {
		//for now always refresh until we have events
		const jobs = await clients.jobClient.listJobs({});
		for (const job of jobs.jobs) {
			if (job.entity?.id) {
				this.Jobs.set(job.entity.id, job);
			}
		}
		return this.Jobs;
	}
	async startJob({ monsterId, jobDefinitionId }: { monsterId: string; jobDefinitionId: string }): Promise<string> {
		const response = await clients.jobClient.startProductionJob({
			userId: userStore.getUser().userId!,
			monsterId: monsterId,
			jobDefinitionId: jobDefinitionId,
		});
		await Promise.all([this.getJobs(), this.getMonsters()]);
		return response.jobId;
	}

	async stopJob(id: string): Promise<void> {
		await clients.jobClient.deleteJob({ id: id });
		await Promise.all([this.getJobs()]);
	}

	async getInventories(): Promise<SvelteMap<string, Inventory>> {
		//for now always refresh until we have events
		const inventories = await clients.inventoryClient.getInventory({ userId: userStore.getUser().userId! });
		this.Inventories.clear();
		for (const inventory of inventories.cities) {
			if (inventory.entity?.id) {
				this.Inventories.set(inventory.entity.id, inventory.inventory!);
			}
		}
		return this.Inventories;
	}
	async equipItem({
		monsterId,
		itemId,
		quantity,
	}: {
		monsterId: string;
		itemId: string;
		quantity: number;
	}): Promise<void> {
		await clients.inventoryClient.equipItem({
			userId: userStore.getUser().userId!,
			monsterId: monsterId,
			itemId: itemId,
			quantity: BigInt(quantity),
		});
		await this.getMonsters();
	}
	async unEquipItem({ monsterId, itemId }: { monsterId: string; itemId: string }): Promise<void> {
		await clients.inventoryClient.unEquipItem({
			userId: userStore.getUser().userId!,
			monsterId: monsterId,
			itemId: itemId,
		});
		await this.getMonsters();
	}

	async eventStream() {
		const eventStream = clients.streamClient.getEvents({ userId: userStore.getUser().userId! });
		for await (const e of eventStream) {
			console.log(e.events[0].eventType);
		}
	}
}

let wasmReadyResolve!: () => void;
let wasmReady: Promise<void> | null = null;
let wasmInstance: WebAssembly.Instance | null = null;
let go: any;

// Initialize WASM if Go is available (loaded from wasm_exec.js)
export function initializeWasm(): Promise<void> {
	if (wasmReady) return wasmReady;

	wasmReady = (async () => {
		if (typeof window.Go === "undefined") {
			throw new Error("Go WASM runtime not loaded");
		}

		go = new window.Go();

		const result = await WebAssembly.instantiateStreaming(
			fetch("/domain.wasm"),
			go.importObject
		);

		wasmInstance = result.instance;

		// JS hook that Go will call when ready
		(window as any).__wasmReady = () => {
			wasmReadyResolve();
		};

		// Start Go (this never returns)
		console.log("Starting Go WASM");
		go.run(wasmInstance);
		console.log("Ending?");
	})();

	// Create the promise Go will resolve
	wasmReady = new Promise<void>((resolve) => {
		wasmReadyResolve = resolve;
	});

	return wasmReady;
}

export const gameStateStore = new GameStateStore();

// Initialize WASM when module loads
initializeWasm().then(() => {
	// Start event stream after WASM is ready
	gameStateStore.eventStream();
});
