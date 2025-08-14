import { createConnectTransport } from '@connectrpc/connect-web';
import { createClient } from '@connectrpc/connect';
import { InventoryService, JobService, MonsterService } from '../../gen/v1/service_pb';

const transport = createConnectTransport({
	baseUrl: 'http://localhost:8080',
});

export const monsterClient = createClient(MonsterService, transport);
export const inventoryClient = createClient(InventoryService, transport);
export const jobClient = createClient(JobService, transport);
