import { toJsonString } from '@bufbuild/protobuf';
import { SvelteMap } from 'svelte/reactivity';

import type { EntityState, Event, JobView, EntityState as MonsterType } from '../../gen/v1/domain_pb';
import { EntityType, GameStateSchema } from '../../gen/v1/domain_pb';
import type { EntityChange } from '../../gen/v1/wasm_pb';
import { EntityChangeKind } from '../../gen/v1/wasm_pb';
import { clients } from '$lib/service/connect';
import { userStore } from './user.svelte';
import { initializeWasm } from './wasm';
import { type InventoryView } from '$gen/v1/views_pb';
import { createWasmClients, type WasmServices } from '$lib/service/wasm';
import { JobSubType } from '$gen/v1/masterdata_pb';

type EntityInvalidation = Pick<EntityChange, 'entityId' | 'kind'>;

declare global {
	interface Window {
		loadGameState: (gameStateJson: string) => void;
		invokeWasm: (reqJson: string) => string;
		Go?: new () => {
			importObject: WebAssembly.Imports;
			run: (instance: WebAssembly.Instance) => Promise<void>;
		};
	}
}

export class GameStateStore {
	Monsters: SvelteMap<string, EntityState>;
	Jobs: SvelteMap<string, JobView>;
	Inventories: SvelteMap<string, InventoryView>;
	Events: Event[] = $state([]);
	private initPromise: Promise<void> | null = null;
	private streamStarted = false;
	private wasmClients!: WasmServices;

	constructor() {
		this.Monsters = new SvelteMap<string, MonsterType>();
		this.Jobs = new SvelteMap<string, JobView>();
		this.Inventories = new SvelteMap<string, InventoryView>();
	}

	getUserMonsters(): MonsterType[] {
		return Array.from(this.Monsters.values()).filter((m) => m.owner?.entity == userStore.getUser().userId);
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

	private async refreshInventory(entityId: string): Promise<void> {
		const response = await this.wasmClients.inventoryService.getInventory({ userId: entityId });
		if (!response.inventory) throw new Error(`GetInventory returned no inventory for ${entityId}`);
		this.Inventories.set(entityId, response.inventory);
	}

	private async refreshJobInventory(job: JobView): Promise<void> {
		const inventoryId = job.job?.subType === JobSubType.TRANSPORT ? job.entity?.id : job.parent?.entityId;
		if (!inventoryId) return;

		if (job.job?.subType === JobSubType.TRANSPORT || !this.Inventories.has(inventoryId)) {
			await this.refreshInventory(inventoryId);
		}
	}

	private async refreshFromWasm(): Promise<void> {
		const nextMonsters = new SvelteMap<string, MonsterType>();
		const nextJobs = new SvelteMap<string, JobView>();
		const nextInventories = new SvelteMap<string, InventoryView>();
		const jobs = await this.wasmClients.jobService.listJobs({});
		for (const job of jobs.jobs) {
			const id = job.entity?.id;
			if (id) nextJobs.set(id, job);
		}

		const userId = userStore.getUser().userId;
		const monsters = await this.wasmClients.monsterService.listMonsters({});

		for (const mon of monsters.monsters.toSorted((x, y) => (x.entity?.id ?? '').localeCompare(y.entity?.id ?? ''))) {
			const id = mon.entity?.id;
			if (!id) continue;

			nextMonsters.set(id, mon);
		}
		const inventories = await this.wasmClients.inventoryService.getPlayerInventory({ userId: userId });

		for (const inv of inventories.locations) {
			const id = inv.entity?.entity?.id;
			if (id) nextInventories.set(id, inv);
		}

		this.Monsters.clear();
		this.Jobs.clear();

		for (const [id, mon] of nextMonsters) this.Monsters.set(id, mon);
		for (const [id, job] of nextJobs) this.Jobs.set(id, job);
		for (const [id, inv] of nextInventories) this.Inventories.set(id, inv);

		await Promise.all(Array.from(nextJobs.values(), (job) => this.refreshJobInventory(job)));
	}

	private async refreshChangedEntities(changes: SvelteMap<string, EntityInvalidation>): Promise<void> {
		await Promise.all(Array.from(changes.values(), (change) => this.refreshChangedEntity(change)));
	}

	private async refreshChangedEntity(change: EntityInvalidation): Promise<void> {
		const { entityId, kind } = change;
		if (kind === EntityChangeKind.REMOVED) {
			this.Monsters.delete(entityId);
			this.Jobs.delete(entityId);
			this.Inventories.delete(entityId);
			return;
		}

		const response = await this.wasmClients.wasmService.getEntity({ entityId });
		const entity = response.entity;
		if (!entity?.entity) throw new Error(`GetEntity returned no state for ${entityId}`);
		const entityType = entity.entity.entityType;
		switch (entityType) {
			case EntityType.MONSTER: {
				this.Monsters.set(entityId, entity);
				break;
			}
			case EntityType.JOB: {
				const job = await this.wasmClients.jobService.getJob({ id: entityId });
				this.Jobs.set(entityId, job);
				await this.refreshJobInventory(job);
				break;
			}
			case EntityType.PLAYER_LOCATION:
				await this.refreshInventory(entityId);
				break;
			case EntityType.USER:
			case EntityType.UNSPECIFIED:
				break;
		}
	}

	private startEventStream(): void {
		if (this.streamStarted) return;
		this.streamStarted = true;

		(async () => {
			const eventStream = clients.streamClient.getEvents({ userId: userStore.getUser().userId });
			for await (const payload of eventStream) {
				const changes = new SvelteMap<string, EntityInvalidation>();
				for (const event of payload.events) {
					const eventName = event.eventType || event.eventData.case || 'unknown';
					console.info('[event]', eventName);
					this.Events = [event, ...this.Events].slice(0, 200);

					const result = await this.wasmClients.wasmService.applyEvent({ event });
					for (const change of result.entityChanges) changes.set(change.entityId, change);

					if (!event.eventContext) throw new Error(`Event ${eventName} has no context`);
					const jobId = event.eventContext.jobId;
					if (jobId && changes.get(jobId)?.kind !== EntityChangeKind.REMOVED) {
						changes.set(jobId, {
							entityId: jobId,
							kind: EntityChangeKind.UPDATED,
						});
					}
				}
				await this.refreshChangedEntities(changes);
			}
		})().catch((error) => {
			console.error('event stream failed', error);
			this.streamStarted = false;
		});
	}
}

export const gameStateStore = new GameStateStore();
