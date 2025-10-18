import { SvelteMap } from "svelte/reactivity";
import type { Inventory, Job, Monster } from "../../gen/v1/domain_pb";
import { clients } from "$lib/service/connect";
import { userStore } from "./user.svelte";

export interface GameState {
    Monsters: SvelteMap<number, Monster>;
    Jobs: SvelteMap<number, Job>;
    Inventories: SvelteMap<number, Inventory[]>;
}




class GameStateStore implements GameState {
    Monsters: SvelteMap<number, Monster>;
    Jobs: SvelteMap<number, Job>;
    Inventories: SvelteMap<number, Inventory[]>;
    constructor() {
        this.Monsters = new SvelteMap<number, Monster>();
        this.Jobs = new SvelteMap<number, Job>();
        this.Inventories = new SvelteMap<number, Inventory[]>();
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
}



export const gameStateStore = new GameStateStore();