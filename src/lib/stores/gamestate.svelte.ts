import { fromJsonString, toJsonString } from '@bufbuild/protobuf';
import { SvelteMap } from 'svelte/reactivity';

import type { Inventory, Job, Monster as MonsterType } from '../../gen/v1/domain_pb';
import { EventSchema, GameStateSchema, InventorySchema, JobSchema, MonsterSchema } from '../../gen/v1/domain_pb';
import { clients } from '$lib/service/connect';
import { userStore } from './user.svelte';
import { initializeWasm } from './wasm';

declare global {
	interface Window {
		loadGameState: (gameStateJson: string) => void;
		listMonsterIDs: () => string;
		listJobIDs: () => string;
		listInventoryIDs: () => string;
		getMonster: (id: string) => string;
		getJob: (id: string) => string;
		getInventory: (id: string) => string;
		applyEvent: (eventJson: string) => void;
		Go?: any;
	}
}

export class GameStateStore {
	Monsters: SvelteMap<string, MonsterType>;
	Jobs: SvelteMap<string, Job>;
	Inventories: SvelteMap<string, Inventory>;
	private initPromise: Promise<void> | null = null;
	private streamStarted = false;

	constructor() {
		this.Monsters = new SvelteMap<string, MonsterType>();
		this.Jobs = new SvelteMap<string, Job>();
		this.Inventories = new SvelteMap<string, Inventory>();
	}

	async initialize(): Promise<void> {
		if (this.initPromise) return this.initPromise;

		this.initPromise = (async () => {
			await initializeWasm();
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
		if (typeof window.loadGameState !== 'function') {
			throw new Error('WASM function `loadGameState` is unavailable');
		}
		window.loadGameState(toJsonString(GameStateSchema, response.gamestate));
		this.refreshFromWasm();
	}

	private refreshFromWasm(): void {
		if (
			typeof window.listMonsterIDs !== 'function' ||
			typeof window.listJobIDs !== 'function' ||
			typeof window.listInventoryIDs !== 'function' ||
			typeof window.getMonster !== 'function' ||
			typeof window.getJob !== 'function' ||
			typeof window.getInventory !== 'function'
		) {
			throw new Error('Required WASM read functions are unavailable');
		}

		const nextMonsters = new SvelteMap<string, MonsterType>();
		const nextJobs = new SvelteMap<string, Job>();
		const nextInventories = new SvelteMap<string, Inventory>();
		const monsterIDs = JSON.parse(window.listMonsterIDs()) as string[];
		const jobIDs = JSON.parse(window.listJobIDs()) as string[];
		const inventoryIDs = JSON.parse(window.listInventoryIDs()) as string[];

		for (const id of monsterIDs) {
			const raw = window.getMonster(id);
			if (!raw) continue;
			nextMonsters.set(id, fromJsonString(MonsterSchema, raw, { ignoreUnknownFields: true }));
		}

		for (const id of jobIDs) {
			const raw = window.getJob(id);
			if (!raw) continue;
			nextJobs.set(id, fromJsonString(JobSchema, raw, { ignoreUnknownFields: true }));
		}

		for (const id of inventoryIDs) {
			const raw = window.getInventory(id);
			if (!raw) continue;
			nextInventories.set(id, fromJsonString(InventorySchema, raw, { ignoreUnknownFields: true }));
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
		const job = this.Jobs.get(id);
		if (!job) throw 'job not found';
		return job;
	}

	async getInventories(): Promise<SvelteMap<string, Inventory>> {
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
