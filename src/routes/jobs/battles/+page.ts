import { loadConfig } from '$lib/config/config';
import log from '$lib/log/log';
import { JobsClient } from '$lib/service/jobs';
import { MonsterClient } from '$lib/service/monsters';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const cfg = loadConfig();
	const jobsClient = new JobsClient(fetch, cfg.jobsClientCfg);
	const monsterClient = new MonsterClient(fetch, cfg.monsterClientCfg);
	const masterdata = jobsClient.getBattleJobMasterdata();

	let activeGatheringJobs = await masterdata;
	activeGatheringJobs = activeGatheringJobs.filter((job) => job.jobType === 'battle');
	let activeJobs = await jobsClient.getJobs();
	log.debug('activeJobs', activeJobs);
	activeJobs = activeJobs.filter((job) => job.jobType === 'battle');

	return {
		masterdata: activeGatheringJobs,
		jobs: activeJobs,
		monsters: await monsterClient.getMonsters(),
	};
};
