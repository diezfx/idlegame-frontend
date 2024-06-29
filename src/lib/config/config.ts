// holds all configuration e.g. the api base url

import type { JobsClientCfg } from "$lib/service/jobs"


export interface Config {
    jobsClientCfg: JobsClientCfg
}


export function loadConfig(): Config {
    return {
        jobsClientCfg: {
            baseUrl: import.meta.env.VITE_JOBS_API_BASE_URL
        }
    }
};