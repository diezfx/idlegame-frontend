import { createConnectTransport } from '@connectrpc/connect-web';
import { ConnectError, createClient, type Client } from '@connectrpc/connect';
import { type ContextValues, type StreamResponse, type Transport, type UnaryResponse } from "@connectrpc/connect";
import {
    RequestSchema,
    ResponseSchema,
} from '../../gen/v1/wasm_pb';
import { type DescMessage, type DescMethodUnary, type MessageInitShape, type DescMethodStreaming, create, fromJsonString, toJsonString } from '@bufbuild/protobuf';
import type { Channel } from '$lib/stores/wasm';
import { InventoryService, JobService, MonsterService } from '$gen/v1/service_pb';


class LocalTransport implements Transport {
    constructor(public chan: Channel) {

    }

    unary<I extends DescMessage, O extends DescMessage>(method: DescMethodUnary<I, O>, signal: AbortSignal | undefined, timeoutMs: number | undefined, header: HeadersInit | undefined, input: MessageInitShape<I>, contextValues?: ContextValues): Promise<UnaryResponse<I, O>> {
        const payload = toJsonString(method.input, create(method.input, input))
        const request = create(RequestSchema, { method: `${method.parent.typeName}/${method.name}`, payload: new TextEncoder().encode(payload?.toString()) })
        const respBin = this.chan.invoke(toJsonString(RequestSchema, request))

        const resp = fromJsonString(ResponseSchema, respBin);


        if (resp.status != 0) {
            throw new ConnectError("error occured", resp.status)
        }

        const respBody = fromJsonString(method.output, new TextDecoder().decode(resp.payload))

        return Promise.resolve({
            stream: false,
            service: method.parent,
            method,
            header: new Headers(),
            trailer: new Headers(),
            message: respBody,
        });
    }
    stream<I extends DescMessage, O extends DescMessage>(method: DescMethodStreaming<I, O>, signal: AbortSignal | undefined, timeoutMs: number | undefined, header: HeadersInit | undefined, input: AsyncIterable<MessageInitShape<I>>, contextValues?: ContextValues): Promise<StreamResponse<I, O>> {
        throw new Error('Method not implemented.');
    }

}


export interface WasmServices {
    monsterService: Client<typeof MonsterService>
    inventoryService: Client<typeof InventoryService>
    jobService: Client<typeof JobService>
}

function createWasmClients(chan: Channel): WasmServices {
    const transport = new LocalTransport(chan);

    const monsterService = createClient(MonsterService, transport);
    const inventoryService = createClient(InventoryService, transport)
    const jobService = createClient(JobService, transport);

    return { monsterService, inventoryService, jobService }
}


export { createWasmClients }
