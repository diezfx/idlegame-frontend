
/*
{
        "id": 1,
        "jobDefId": "spruce",
        "userId": 1,
        "startedAt": "2024-05-19T21:34:32.875981+02:00",
        "updatedAt": "2024-05-19T21:41:58.788766+02:00",
        "monsterIds": [
            1
        ],
        "jobType": "woodcutting"
    }
*/

export interface Job {
    id: number;
    jobDefId: string;
    userId: number;
    startedAt: string;
    updatedAt: string;
    monsterIds: number[];
    jobType: string;
}

export interface JobsClientCfg {
    baseUrl: string;
}


export class JobsClient {
    baseUrl: string;
    fetch: any;
    constructor(fetch: any, cfg: JobsClientCfg) {
        this.baseUrl = cfg.baseUrl;
        this.fetch = fetch;
    }


    async getJobs(): Promise<Job[]> {
        const response = await this.fetch(`${this.baseUrl}/v1.0/jobs`);
        const data = await response.json() as Job[];
        return data;
    }
}