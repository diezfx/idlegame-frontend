import { JobsClient } from '$lib/service/jobs';
import { MonsterClient } from '$lib/service/monsters';
import type { PageLoad } from '../$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ fetch, params }) => {
	const jobsClient = new JobsClient(fetch);
	const monsterClient = new MonsterClient(fetch);
	const masterdata = jobsClient.getBattleJobMasterdata();

	const battleJob = await jobsClient.getBattleJob(BigInt(params.id));
	if (!battleJob) {
		redirect(302, '/jobs/battles');
	}

	return {
		masterdata: masterdata,
		battleJob: battleJob,
		monsters: await monsterClient.getMonsters(),
	};
};
