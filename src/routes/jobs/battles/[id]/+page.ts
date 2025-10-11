import { createClients } from '$lib/service/connect';
import { JobsClient } from '$lib/service/jobs';
import { MonsterClient } from '$lib/service/monsters';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ fetch, parent, params }) => {
	const jobsClient = new JobsClient(fetch);
	const monsterClient = new MonsterClient(fetch);
	const masterdata = await createClients(fetch).masterdataClient.getBattleJobs({ cityId: 'city_1' });

	const parentData: any = await parent();
	const user = parentData?.user;

	if (!params.id) {
		throw redirect(302, '/jobs/battles');
	}


	const battleJob = await jobsClient.getBattleJob(BigInt(params.id));
	if (!battleJob) {
		throw redirect(302, '/jobs/battles');
	}

	const monsters = await monsterClient.getMonsters(user?.userId);

	return {
		masterdata,
		battleJob,
		monsters,
	};
};
