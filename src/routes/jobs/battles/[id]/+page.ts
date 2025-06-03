import { loadConfig } from '$lib/config/config';
import { JobsClient } from '$lib/service/jobs';
import { MonsterClient } from '$lib/service/monsters';
import type { PageLoad } from '../$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ fetch, params }) => {
	const cfg = loadConfig();
	const jobsClient = new JobsClient(fetch, cfg.jobsClientCfg);
	const monsterClient = new MonsterClient(fetch, cfg.monsterClientCfg);
	const masterdata = jobsClient.getBattleJobMasterdata();

	let battleJob = await jobsClient.getBattleJob(params.id);
	if (!battleJob) {
		redirect(302, '/jobs/battles');
	}

	return {
		masterdata: masterdata,
		battleJob: battleJob,
		monsters: await monsterClient.getMonsters(),
	};
};
