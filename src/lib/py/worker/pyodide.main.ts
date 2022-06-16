/**
 * Main thread interface for interacting with worker module
 *
 * // TODO Actually adopt for use elsehwere
 */

import {
    MainSubTopics,
    WorkerSubTopics,
    type IRestartWorkerSubPayload,
    type IRunWorkerSubPayload,
    type IOutputMainSub,
    type IRunCompleteMainSub,
    type IRunStartMainSub,
    type IStartupMainSub,
    type IMainSubUnion,
    type IWorkerCmdsUnion,
    type IWorkerErrorMainSub
} from '$lib/py/protocol';
import PyodideWorker from './pyodide.worker?worker';

export interface IPyodideMainOnMessageCallbacks {
    handleStartup?: (data: IStartupMainSub, client: PyodideMain) => Promise<void>;
    handleOutput?: (data: IOutputMainSub, client: PyodideMain) => Promise<void>;
    handleRunStart?: (data: IRunStartMainSub, client: PyodideMain) => Promise<void>;
    handleRunComplete?: (data: IRunCompleteMainSub, client: PyodideMain) => Promise<void>;
    handleWorkerError?: (data: IWorkerErrorMainSub, client: PyodideMain) => Promise<void>;
}

/**
 * Client: Send messages to worker.
 */
export class PyodideMainClient {
    constructor(public worker: Worker) {}

    private _postMessage(data: IWorkerCmdsUnion): void {
        // if (!this.worker) {
        // 	// QUESTION Want to add a pre-worker command buffer instead of an error here? Will
        // 	// call all postMessage once worker is set.
        // 	throw new Error(
        // 		'Worker is not yet set in PyodidePostMessage. Cannot communicate with worker.'
        // 	);
        // }
        this.worker.postMessage(data);
    }

    public runCmd(payload: IRunWorkerSubPayload): void {
        this._postMessage({ cmd: WorkerSubTopics.RUN_CMD, payload });
    }

    public restart(payload: IRestartWorkerSubPayload): void {
        this._postMessage({ cmd: WorkerSubTopics.RESTART, payload });
    }
}

/**
 * Service: Handle incoming messages from pyodide worker.
 */
export class PyodideMainService {
    constructor(public client: PyodideMain, public callbacks: IPyodideMainOnMessageCallbacks) {}

    public async handleWorkerMessage(e: MessageEvent<IMainSubUnion>): Promise<void> {
        const data = e.data;

        // const d = {
        //     [ClientCmdEnum.STARTUP]: this.handleStartup,
        //     [ClientCmdEnum.RUN_COMPLETE]: this.handleRunComplete
        // };
        // const a = d[data.cmd];
        // if (a) {
        //     a(data);
        // }

        switch (data.cmd) {
            case MainSubTopics.STARTUP: {
                return await this.handleStartup(data);
            }
            case MainSubTopics.OUTPUT: {
                return await this.handleOutput(data);
            }
            case MainSubTopics.RUN_START: {
                return await this.handleRunStart(data);
            }
            case MainSubTopics.RUN_COMPLETE: {
                return await this.handleRunComplete(data);
            }
            case MainSubTopics.WORKER_ERROR: {
                return await this.handleWorkerError(data);
            }
            default: {
                throw new Error(`Unknown ClientCmdData command: ${data}`);
            }
        }
    }

    private async handleStartup(data: IStartupMainSub): Promise<void> {
        const cb = this.callbacks.handleStartup || console.log;
        await cb(data, this.client);
    }

    private async handleOutput(data: IOutputMainSub): Promise<void> {
        const cb = this.callbacks.handleOutput || console.log;
        await cb(data, this.client);
    }

    private async handleRunStart(data: IRunStartMainSub): Promise<void> {
        // TODO Track running/not running in the PyodideMain class.
        const cb = this.callbacks.handleRunStart || console.log;
        await cb(data, this.client);
    }

    private async handleRunComplete(data: IRunCompleteMainSub): Promise<void> {
        const cb = this.callbacks.handleRunComplete || console.log;
        await cb(data, this.client);
    }

    private async handleWorkerError(data: IWorkerErrorMainSub): Promise<void> {
        const cb = this.callbacks.handleWorkerError || console.error;
        await cb(data, this.client);
    }
}

export class PyodideMain {
    client: PyodideMainClient;
    svc: PyodideMainService;
    worker: Worker;

    // TODO Add second callbacks layer for use by the main class.
    constructor(callbacks: IPyodideMainOnMessageCallbacks) {
        this.svc = new PyodideMainService(this, callbacks);

        this.worker = new PyodideWorker();
        // this.worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url), { type: 'module' });
        // this.worker = new Worker('/worker.js', { type: 'module' });

        // NOTE MUST do this. Otherwise, "this" within `handleWorkerMessage` is that of the worker,
        // 	not the service.
        // 	this.worker.onmessage = this.svc.handleWorkerMessage;
        this.worker.onmessage = async (e) => this.svc.handleWorkerMessage(e);

        this.client = new PyodideMainClient(this.worker);
    }

    // async init() {} // TODO Need init here??

    get isReady(): boolean {
        return !!this.worker && !!this.client;
    }
}

/**
 * Callbacks class
 * TODO Make this do something interesting.
 */
export class DefaultPyodideMainCallbacks implements IPyodideMainOnMessageCallbacks {
    static async handleStartup(data: IStartupMainSub, client: PyodideMain): Promise<void> {
        console.info(data);
        console.log(client);
    }
    static async handleOutput(data: IOutputMainSub, client: PyodideMain): Promise<void> {
        console.info(data);
        console.log(client);
    }
    static async handleRunStart(data: IRunStartMainSub, client: PyodideMain): Promise<void> {
        console.info(data);
        console.log(client);
    }
    static async handleRunComplete(data: IRunCompleteMainSub, client: PyodideMain): Promise<void> {
        console.info(data);
        console.log(client);
    }
    static async handleWorkerError(data: IWorkerErrorMainSub, client: PyodideMain): Promise<void> {
        console.error(data);
        console.log(client);
    }
}
