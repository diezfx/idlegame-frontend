import { createConnectTransport } from '@connectrpc/connect-web';
import { createClient } from '@connectrpc/connect';
import { InventoryService, JobService, MasterdataService, MonsterService } from '../../gen/v1/service_pb';

const transport = createConnectTransport({
	baseUrl: 'http://localhost:8080',
	useBinaryFormat: false,
});

export const monsterClient = createClient(MonsterService, transport);
export const inventoryClient = createClient(InventoryService, transport);
export const jobClient = createClient(JobService, transport);
export const masterdataClient = createClient(MasterdataService, transport);
