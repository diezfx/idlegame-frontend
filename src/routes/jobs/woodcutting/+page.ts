import { loadConfig } from '$lib/config/config';
import log from '$lib/log/log';
import { JobsClient } from '$lib/service/jobs';
import { MonsterClient } from '$lib/service/monsters';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
    const cfg = loadConfig();
    const jobsClient = new JobsClient(fetch, cfg.jobsClientCfg);
    const monsterClient = new MonsterClient(fetch, cfg.monsterClientCfg);
    const masterdata = jobsClient.getJobMasterdata();

    let woodcuttingJobs = await masterdata;
    woodcuttingJobs = woodcuttingJobs.filter((job) => job.jobType === 'woodcutting');
    let activeJobs = await jobsClient.getJobs();
    log.debug('activeJobs', activeJobs);
    activeJobs = activeJobs.filter((job) => job.jobType === 'woodcutting');

    return {
        masterdata: woodcuttingJobs,
        jobs: activeJobs,
        monsters: await monsterClient.getMonsters(),
    };
};
