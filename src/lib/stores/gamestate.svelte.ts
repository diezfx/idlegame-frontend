import { SvelteMap } from 'svelte/reactivity';
import type { Inventory, Job, Monster } from '../../gen/v1/domain_pb';
import { clients } from '$lib/service/connect';
import { userStore } from './user.svelte';
import { Code, ConnectError } from '@connectrpc/connect';

export class GameStateStore {
	Monsters: SvelteMap<number, Monster>;
	Jobs: SvelteMap<number, Job>;
	Inventories: SvelteMap<number, Inventory>;
	constructor() {
		eventStream()
		setInterval(() => {
			Promise.all([this.getMonsters(), this.getJobs(), this.getInventories()]);
		}, 5000);
		this.Monsters = new SvelteMap<number, Monster>();
		this.Jobs = new SvelteMap<number, Job>();
		this.Inventories = new SvelteMap<number, Inventory>();
	}

	async getMonsters(): Promise<SvelteMap<number, Monster>> {
		//for now always refresh until we have events
		const monsters = await clients.monsterClient.listMonsters({ ownerId: BigInt(1) });
		for (const monster of monsters.monsters) {
			this.Monsters.set(Number(monster.entity?.id), monster);
		}

		return this.Monsters;
	}

	async getJob(id: bigint): Promise<Job> {
		if (!this.Jobs.has(Number(id))) {
			try {
				const job = await clients.jobClient.getJob({ id: id });
				this.Jobs.set(Number(job.entity?.id), job);
				return job;
			}
			catch (e) {
				if (e instanceof ConnectError && e.code == Code.NotFound) {
					throw "job not found"
				}
				throw e;
			}
		}
		return this.Jobs.get(Number(id))!;
	}

	async getMonster(id: bigint): Promise<Monster> {
		try {
			if (!this.Monsters.has(Number(id))) {
				const mon = await clients.monsterClient.getMonster({ id: id })
				this.Monsters.set(Number(mon.entity?.id), mon)
				return mon
			}
		}
		catch (e) {
			if (e instanceof ConnectError && e.code == Code.NotFound) {
				throw "monster not found"
			}
			throw e;
		}
		return this.Monsters.get(Number(id))!;
	}

	async getJobs(): Promise<SvelteMap<number, Job>> {
		//for now always refresh until we have events
		const jobs = await clients.jobClient.listJobs({});
		for (const job of jobs.jobs) {
			this.Jobs.set(Number(job.entity?.id), job);
		}
		return this.Jobs;
	}
	async startJob({ monsterId, jobDefinitionId }: { monsterId: bigint; jobDefinitionId: string }): Promise<bigint> {
		const response = await clients.jobClient.startProductionJob({
			userId: BigInt(userStore.getUser().userId!),
			monsterId: monsterId,
			jobDefinitionId: jobDefinitionId,
		});
		await Promise.all([this.getJobs(), this.getMonsters()]);
		return response.jobId;
	}

	async stopJob(id: bigint): Promise<void> {
		await clients.jobClient.deleteJob({ id: id });
		await Promise.all([this.getJobs()]);
	}

	async getInventories(): Promise<SvelteMap<number, Inventory>> {
		//for now always refresh until we have events
		const inventories = await clients.inventoryClient.getInventory({ userId: BigInt(userStore.getUser().userId!) });
		this.Inventories.clear();
		for (const inventory of inventories.cities) {
			this.Inventories.set(Number(inventory.entity?.id), inventory.inventory!);
		}
		return this.Inventories;
	}
	async equipItem({
		monsterId,
		itemId,
		quantity,
	}: {
		monsterId: bigint;
		itemId: string;
		quantity: number;
	}): Promise<void> {
		await clients.inventoryClient.equipItem({
			userId: BigInt(userStore.getUser().userId!),
			monsterId: monsterId,
			itemId: itemId,
			quantity: BigInt(quantity),
		});
		await this.getMonsters();
	}
	async unEquipItem({ monsterId, itemId }: { monsterId: bigint; itemId: string }): Promise<void> {
		await clients.inventoryClient.unEquipItem({
			userId: BigInt(userStore.getUser().userId!),
			monsterId: monsterId,
			itemId: itemId,
		});
		await this.getMonsters();
	}
}


async function eventStream() {
	const eventStream = clients.streamClient.getEvents({ userId: "1" })
	for await (const e of eventStream) {
		console.log(e.events[0].eventType)
	}

}

export const gameStateStore = new GameStateStore();
