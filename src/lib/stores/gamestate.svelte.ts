import { toJsonString } from '@bufbuild/protobuf';
import { SvelteMap } from 'svelte/reactivity';

import type { Event, Job, Monster as MonsterType } from '../../gen/v1/domain_pb';
import { EventSchema, GameStateSchema } from '../../gen/v1/domain_pb';
import { clients } from '$lib/service/connect';
import { userStore } from './user.svelte';
import { initializeWasm } from './wasm';
import { type InventoryView } from '$gen/v1/views_pb';
import { createWasmClients, type WasmServices } from '$lib/service/wasm';

declare global {
	interface Window {
		loadGameState: (gameStateJson: string) => void;
		invokeWasm: (reqJson: string) => string;
		listMonsterIDs: () => string;
		applyEvent: (eventJson: string) => void;
		Go?: any;
	}
}

export class GameStateStore {
	Monsters: SvelteMap<string, MonsterType>;
	Jobs: SvelteMap<string, Job>;
	Inventories: SvelteMap<string, InventoryView>;
	Events: Event[] = $state([]);
	private initPromise: Promise<void> | null = null;
	private streamStarted = false;
	wasmClients!: WasmServices

	constructor() {
		this.Monsters = new SvelteMap<string, MonsterType>();
		this.Jobs = new SvelteMap<string, Job>();
		this.Inventories = new SvelteMap<string, InventoryView>();
	}

	async initialize(): Promise<void> {
		if (this.initPromise) return this.initPromise;

		this.initPromise = (async () => {
			await initializeWasm();

			this.wasmClients = createWasmClients({ invoke: window.invokeWasm });
			await this.bootstrapFromGamestateByUser();
			this.startEventStream();
		})();

		return this.initPromise;
	}

	private async ensureInitialized(): Promise<void> {
		if (!this.initPromise) {
			await this.initialize();
			return;
		}
		await this.initPromise;
	}

	private async bootstrapFromGamestateByUser(): Promise<void> {
		const response = await clients.gamestateClient.getGamestateByUser({ userId: userStore.getUser().userId });
		if (!response.gamestate) {
			throw new Error('GetGamestateByUser returned empty gamestate');
		}
		if (typeof window.invokeWasm !== 'function') {
			throw new Error('WASM function `invokeWasm` is unavailable');
		}
		if (typeof window.loadGameState !== 'function') {
			throw new Error('WASM function `loadGameState` is unavailable');
		}
		window.loadGameState(toJsonString(GameStateSchema, response.gamestate));
		await this.refreshFromWasm();
		this.Events = [];
	}

	private async refreshFromWasm(): Promise<void> {
		const nextMonsters = new SvelteMap<string, MonsterType>();
		const nextJobs = new SvelteMap<string, Job>();
		const nextInventories = new SvelteMap<string, InventoryView>();
		const jobs = await this.wasmClients.jobService.listJobs({})
		for (const job of jobs.jobs) {
			nextJobs.set(job.entity?.id!, job)
		}

		const userId = userStore.getUser().userId;
		const monsters = await this.wasmClients.monsterService.listMonsters({ ownerId: userId });
		for (const mon of monsters.monsters) {
			nextMonsters.set(mon.entity?.id!, mon)

		}

		const inventories = await this.wasmClients.inventoryService.getPlayerInventory({ userId: userId })

		for (const inv of inventories.locations) {
			nextInventories.set(inv.entity?.id!, inv);
		}

		this.Monsters.clear();
		this.Jobs.clear();
		this.Inventories.clear();

		for (const [id, mon] of nextMonsters) this.Monsters.set(id, mon);
		for (const [id, job] of nextJobs) this.Jobs.set(id, job);
		for (const [id, inv] of nextInventories) this.Inventories.set(id, inv);
	}

	private startEventStream(): void {
		if (this.streamStarted) return;
		this.streamStarted = true;

		(async () => {
			const eventStream = clients.streamClient.getEvents({ userId: userStore.getUser().userId });
			for await (const payload of eventStream) {
				for (const event of payload.events) {
					const eventName = event.eventType || event.eventData.case || 'unknown';
					console.info('[event]', eventName);
					this.Events = [event, ...this.Events].slice(0, 200);
					window.applyEvent(toJsonString(EventSchema, event));
				}
				this.refreshFromWasm();
			}
		})().catch((error) => {
			console.error('event stream failed', error);
			this.streamStarted = false;
		});
	}

	async getMonsters(): Promise<SvelteMap<string, MonsterType>> {
		await this.ensureInitialized();
		return this.Monsters;
	}

	async getMonster(id: string): Promise<MonsterType> {
		await this.ensureInitialized();
		const mon = this.Monsters.get(id);
		if (!mon) throw 'monster not found';
		return mon;
	}

	async getJobs(): Promise<SvelteMap<string, Job>> {
		await this.ensureInitialized();
		return this.Jobs;
	}

	async getJob(id: string): Promise<Job> {
		await this.ensureInitialized();
		const job = await this.wasmClients.jobService.getJob({ id: id })
		if (!job) throw 'job not found';
		//this.Jobs.set(id, job)
		return job;
	}

	async getInventory(id: string): Promise<InventoryView> {
		await this.ensureInitialized();
		const inv = await this.wasmClients.inventoryService.getInventory({ userId: id })
		if (!inv) throw 'inv not found';
		//this.Jobs.set(id, job)
		return inv.inventory!;
	}

	async getInventories(): Promise<SvelteMap<string, InventoryView>> {
		await this.ensureInitialized();
		return this.Inventories;
	}

	async startJob({ monsterId, jobDefinitionId }: { monsterId: string; jobDefinitionId: string }): Promise<string> {
		await this.ensureInitialized();
		const response = await clients.jobClient.startProductionJob({
			userId: userStore.getUser().userId,
			monsterId: monsterId,
			jobDefinitionId: jobDefinitionId,
		});
		return response.jobId;
	}

	async stopJob(id: string): Promise<void> {
		await this.ensureInitialized();
		await clients.jobClient.deleteJob({ id: id });
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
		await this.ensureInitialized();
		await clients.inventoryClient.equipItem({
			userId: userStore.getUser().userId,
			monsterId: monsterId,
			itemId: itemId,
			quantity: BigInt(quantity),
		});
	}

	async unEquipItem({ monsterId, itemId }: { monsterId: string; itemId: string }): Promise<void> {
		await this.ensureInitialized();
		await clients.inventoryClient.unEquipItem({
			userId: userStore.getUser().userId,
			monsterId: monsterId,
			itemId: itemId,
		});
	}
}

export const gameStateStore = new GameStateStore();
