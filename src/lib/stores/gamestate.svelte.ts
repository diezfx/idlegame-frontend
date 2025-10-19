import { SvelteMap } from "svelte/reactivity";
import type { Inventory, Job, Monster } from "../../gen/v1/domain_pb";
import { clients } from "$lib/service/connect";
import { userStore } from "./user.svelte";





class GameStateStore {
    Monsters: SvelteMap<number, Monster>;
    Jobs: SvelteMap<number, Job>;
    Inventories: SvelteMap<number, Inventory>;
    constructor() {
        setInterval(() => {
            Promise.all([this.getMonsters(), this.getJobs(), this.getInventories()]);
        }, 5000);
        this.Monsters = new SvelteMap<number, Monster>();
        this.Jobs = new SvelteMap<number, Job>();
        this.Inventories = new SvelteMap<number, Inventory>();
    }

    async getMonsters(): Promise<SvelteMap<number, Monster>> {

        //for now always refresh until we have events
        const monsters = await clients.monsterClient.listMonsters({ ownerId: BigInt(1) })
        for (const monster of monsters.monsters) {
            this.Monsters.set(Number(monster.entity?.id), monster);
        }


        return this.Monsters;
    }

    async getJobs(): Promise<SvelteMap<number, Job>> {
        //for now always refresh until we have events
        const jobs = await clients.jobClient.listJobs({})
        this.Jobs.clear();
        for (const job of jobs.jobs) {
            this.Jobs.set(Number(job.entity?.id), job);
        }
        return this.Jobs;
    }
    async startJob({ monsterId, jobDefinitionId }: { monsterId: bigint, jobDefinitionId: string }): Promise<bigint> {
        const response = await clients.jobClient.startProductionJob({
            userId: BigInt(userStore.getUser().userId!),
            monsterId: monsterId,
            jobDefinitionId: jobDefinitionId
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
        const inventories = await clients.inventoryClient.getInventory({ userId: BigInt(userStore.getUser().userId!) })
        this.Inventories.clear();
        for (const inventory of inventories.cities) {
            this.Inventories.set(Number(inventory.id), inventory.inventory!);
        }
        return this.Inventories;
    }
    async equipItem({ monsterId, itemId, quantity }: { monsterId: bigint, itemId: string, quantity: number }): Promise<void> {
        await clients.inventoryClient.equipItem({
            userId: BigInt(userStore.getUser().userId!),
            monsterId: monsterId,
            itemId: itemId,
            quantity: BigInt(quantity),
        });
        await this.getMonsters();
    }
    async unEquipItem({ monsterId, itemId }: { monsterId: bigint, itemId: string, }): Promise<void> {
        await clients.inventoryClient.unEquipItem({
            userId: BigInt(userStore.getUser().userId!),
            monsterId: monsterId,
            itemId: itemId,
        });
        await this.getMonsters();
    }
}



export const gameStateStore = new GameStateStore();