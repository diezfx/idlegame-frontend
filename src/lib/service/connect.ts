import { createConnectTransport } from '@connectrpc/connect-web';
import { createClient } from '@connectrpc/connect';
import { InventoryService, JobService, MasterdataService, MonsterService } from '../../gen/v1/service_pb';

export function createClients(customFetch?: typeof globalThis.fetch) {
	const transport = createConnectTransport({
		baseUrl: 'http://localhost:8080',
		useBinaryFormat: false,
		fetch: customFetch,
	});

	return {
		monsterClient: createClient(MonsterService, transport),
		inventoryClient: createClient(InventoryService, transport),
		jobClient: createClient(JobService, transport),
		masterdataClient: createClient(MasterdataService, transport)
	};
}