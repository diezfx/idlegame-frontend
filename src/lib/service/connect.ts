import { createConnectTransport } from '@connectrpc/connect-web';
import { createClient } from '@connectrpc/connect';
import {
	InventoryService,
	JobService,
	MasterdataService,
	MonsterService,
	TutorialService,
	UserService,
} from '../../gen/v1/service_pb';

function createClients() {
	const transport = createConnectTransport({
		baseUrl: 'http://localhost:8080',
		useBinaryFormat: false,
	});

	return {
		monsterClient: createClient(MonsterService, transport),
		inventoryClient: createClient(InventoryService, transport),
		jobClient: createClient(JobService, transport),
		masterdataClient: createClient(MasterdataService, transport),
		tutorialClient: createClient(TutorialService, transport),
		userClient: createClient(UserService, transport),
	};
}

export const clients = createClients();
