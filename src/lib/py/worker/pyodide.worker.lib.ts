// TODO Write this out as a client/server lib.
// NOT NEAR READY
// /**
//  * Worker lib: Need to import + run all of this stuff within narrow context of worker-proper.
//  */

// import { PYODIDE_INDEX_URL } from '$lib/constants';
// import * as pyodidePkg from 'pyodide';

// import {
//     ClientCmdEnum,
//     type IClientCmdsUnion,
//     type IOutputClientCmdPayload,
//     type IRunCompleteClientCmdPayload,
//     type IRunStartClientCmdPayload,
//     type IStartupRunClientCmdPayload,
//     type IWorkerCmdsUnion,
//     type IWorkerErrorClientCmdPayload
// } from '$lib/py/protocol';

// export type PyodideInterface = GetInsidePromise<ReturnType<typeof pyodidePkg.loadPyodide>>;
// type TPostMessage = typeof Worker.prototype.postMessage;

// /**
//  * Orchestrator: Handles client+service together.
//  */
// export class PyodideWorker {
//     svc: PyodideWorkerService;
//     client: PyodideWorkerClient;

//     pyodide?: PyodideInterface;
//     readyPromise?: Promise<void>;

//     constructor(public postMessage: TPostMessage, public indexURL: string) {
//         this.client = new PyodideWorkerClient(postMessage);
//         this.svc = new PyodideWorkerService(this, callbacks);
//     }

//     private async loadPyodideAndPackages(): Promise<void> {
//         const loadPyodide = await loadLoadPyodide();
//         this.pyodide = await loadPyodide({
//             indexURL: this.indexURL,
//             stdout: (msg) => this.client.output({ msg, stream: 'stdout' }),
//             stderr: (msg) => this.client.output({ msg, stream: 'stderr' })
//             // stdin?: () => string; // TODO handle stdin here...see docstring
//         });

//         // this.pyodide.loadPackagesFromImports;
//         // await self.pyodide.loadPackage(['numpy', 'pytz']);
//     }

//     init(): void {
//         this.readyPromise = this.loadPyodideAndPackages()
//             .then(() => this.client.startup({ status: 'ready' }))
//             .catch((err) => this.client.startup({ status: 'failed', err }));
//     }

//     get handleWorkerMessage(): (e: MessageEvent<IWorkerCmdsUnion>) => Promise<void> {
//         return this.svc.handleWorkerMessage;
//     }
// }

// /**
//  * Service: Handles incoming messages from main thread.
//  */
// class PyodideWorkerService {
//     banner: string;
//     reprShorten: string;

//     constructor(public postMessage: TPostMessage) {}

//     // TODO Load pyodide

//     createConsole(): void {}
//     removeConsole(consoleId: string): void {}
//     restartConsole(consoleId: string): void {}

//     // constructor(public worker: PyodideWorker, public callbacks: IPyodideWorkerOnMessageCallbacks) {}

//     // public async handleWorkerMessage(e: MessageEvent<IWorkerCmdsUnion>): Promise<void> {
//     //     // Error case: Worker did not load pyodide.
//     //     if (this.worker.readyPromise == undefined) {
//     //         this.worker.client.workerError({
//     //             err: new Error('Worker does not appear to be initialized. Cannot process request.')
//     //         });
//     //         return;
//     //     }

//     //     // Wait until the worker is ready to process the request.
//     //     await this.worker.readyPromise;
//     //     // NOTE We don't do python context from JS here...

//     //     // Extract request data.
//     //     const data = e.data;

//     //     switch (data.cmd) {
//     //         case WorkerCmdEnum.RUN_CMD: {
//     //             return await this.handleRunCmd(data);
//     //         }
//     //         case WorkerCmdEnum.RESTART: {
//     //             return await this.handleRestart(data);
//     //         }
//     //         default: {
//     //             throw new Error(`Unknown WorkerCmdData command: ${data}`);
//     //         }
//     //     }
//     // }

//     // private async handleRunCmd(data: IRunCmdWorkerCmd): Promise<void> {
//     //     const cb = this.callbacks.handleRunCmd || console.log;
//     //     await cb(data, this.worker);
//     // }

//     // private async handleRestart(data: IRestartWorkerCmd): Promise<void> {
//     //     const cb = this.callbacks.handleRestart || (() => console.error('asf'));
//     //     await cb(data, this.worker);
//     // }
// }

// // interface IPyodideWorkerOnMessageCallbacks {
// //     handleRunCmd?: (data: IRunCmdWorkerCmd, worker: PyodideWorker) => Promise<void>;
// //     handleRestart?: (data: IRestartWorkerCmd, worker: PyodideWorker) => Promise<void>;
// // }

// /**
//  * Client: Dispatches messages to main thread.
//  */
// class PyodideWorkerClient {
//     constructor(public postMessage: TPostMessage) {}
//     private _postMessage(data: IClientCmdsUnion): void {
//         self.postMessage(data);
//     }

//     public startup(payload: IStartupRunClientCmdPayload): void {
//         this._postMessage({ cmd: ClientCmdEnum.STARTUP, payload });
//     }

//     public output(payload: IOutputClientCmdPayload): void {
//         this._postMessage({ cmd: ClientCmdEnum.OUTPUT, payload });
//     }

//     public runStart(payload: IRunStartClientCmdPayload): void {
//         this._postMessage({ cmd: ClientCmdEnum.RUN_START, payload });
//     }
//     public runComplete(payload: IRunCompleteClientCmdPayload): void {
//         this._postMessage({ cmd: ClientCmdEnum.RUN_COMPLETE, payload });
//     }
//     public workerError(payload: IWorkerErrorClientCmdPayload): void {
//         this._postMessage({ cmd: ClientCmdEnum.WORKER_ERROR, payload });
//     }
// }
