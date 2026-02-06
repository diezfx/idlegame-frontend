import { SvelteMap } from 'svelte/reactivity';
import type { Inventory, Job, Monster } from '../../gen/v1/domain_pb';
import { clients } from '$lib/service/connect';
import { userStore } from './user.svelte';
import { Code, ConnectError } from '@connectrpc/connect';

export class GameStateStore {
	Monsters: SvelteMap<string, Monster>;
	Jobs: SvelteMap<string, Job>;
	Inventories: SvelteMap<string, Inventory>;
	constructor() {
		eventStream()
		setInterval(() => {
			Promise.all([this.getMonsters(), this.getJobs(), this.getInventories()]);
		}, 5000);
		this.Monsters = new SvelteMap<string, Monster>();
		this.Jobs = new SvelteMap<string, Job>();
		this.Inventories = new SvelteMap<string, Inventory>();
	}

	async getMonsters(): Promise<SvelteMap<string, Monster>> {
		//for now always refresh until we have events
		const monsters = await clients.monsterClient.listMonsters({ ownerId: userStore.getUser().userId! });
		for (const monster of monsters.monsters) {
			if (monster.entity?.id) {
				this.Monsters.set(monster.entity.id, monster);
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
			}
			catch (e) {
				if (e instanceof ConnectError && e.code == Code.NotFound) {
					throw "job not found"
				}
				throw e;
			}
		}
		return this.Jobs.get(id)!;
	}

	async getMonster(id: string): Promise<Monster> {
		try {
			if (!this.Monsters.has(id)) {
				const mon = await clients.monsterClient.getMonster({ id: id })
				if (mon.entity?.id) {
					this.Monsters.set(mon.entity.id, mon)
				}
				return mon
			}
		}
		catch (e) {
			if (e instanceof ConnectError && e.code == Code.NotFound) {
				throw "monster not found"
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
}


async function eventStream() {
	const eventStream = clients.streamClient.getEvents({ userId: userStore.getUser().userId! })
	for await (const e of eventStream) {
		console.log(e.events[0].eventType)
	}

}

export const gameStateStore = new GameStateStore();
