/**
 * Sets down abstract Pub/Sub classes for each of Main & Worker.
 *
 * For actual implementations, see e.g. the ./worker subdir
 */

import {
    MainSubTopics,
    WorkerSubTopics,
    type IMainSubUnion,
    type IOutputMainSubPayload,
    type IRestartWorkerSubPayload,
    type IRunCompleteMainSubPayload,
    type IRunCompleteStatementMainSubPayload,
    type IRunStartMainSubPayload,
    type IRunStartStatementMainSubPayload,
    type IRunWorkerSubPayload,
    type IStartupMainSubPayload,
    type IWorkerErrorMainSubPayload,
    type IWorkerSubUnion
} from './protocol';

abstract class AbstractPub<M, D extends IWorkerSubUnion | IMainSubUnion> {
    constructor(public mgr: M) {}

    /**
     * Common method for sending the messages.
     *
     * To be implemented depending on worker/main config: web workers v. one thread.
     *
     * @param data A message bundle to be posted/published.
     */
    abstract postMessage(data: D): void;

    // [Define for main + worker] One method for each topic
}

abstract class AbstractSub<E, M, D extends IWorkerSubUnion | IMainSubUnion> {
    constructor(public mgr: M) {}

    /**
     * Top-level method to handle all incoming message.
     *
     * @param e Raw message.
     * @returns An empty promise.
     */
    public async route(e: E): Promise<void> {
        const data = this.parseMessage(e);
        return await this.routeSwitch(data);
    }

    /**
     * Matches command/topic to correct handler.
     *
     * @param data Message data
     */
    abstract routeSwitch(data: D): Promise<void>;

    /**
     * Extracts the message payload from raw message.
     *
     * Defined according to user/runtime config.
     *
     * @param e Raw message receipt format.
     */
    abstract parseMessage(e: E): D;

    // [Defined according to user/runtime config] One method for each topic
}

export abstract class AbstractWorkerPub<M> extends AbstractPub<M, IMainSubUnion> {
    startup(payload: IStartupMainSubPayload): void {
        this.postMessage({ cmd: MainSubTopics.STARTUP, payload });
    }

    output(payload: IOutputMainSubPayload): void {
        this.postMessage({ cmd: MainSubTopics.OUTPUT, payload });
    }
    runStart(payload: IRunStartMainSubPayload): void {
        this.postMessage({ cmd: MainSubTopics.RUN_START, payload });
    }
    runComplete(payload: IRunCompleteMainSubPayload): void {
        this.postMessage({ cmd: MainSubTopics.RUN_COMPLETE, payload });
    }
    runStartStatement(payload: IRunStartStatementMainSubPayload): void {
        this.postMessage({ cmd: MainSubTopics.RUN_START_STATEMENT, payload });
    }
    runCompleteStatement(payload: IRunCompleteStatementMainSubPayload): void {
        this.postMessage({ cmd: MainSubTopics.RUN_COMPLETE_STATEMENT, payload });
    }
    workerError(payload: IWorkerErrorMainSubPayload): void {
        this.postMessage({ cmd: MainSubTopics.WORKER_ERROR, payload });
    }
}

export abstract class AbstractMainPub<M> extends AbstractPub<M, IWorkerSubUnion> {
    // [Define for main + worker] One method for each topic
    runCmd(payload: IRunWorkerSubPayload): void {
        this.postMessage({ cmd: WorkerSubTopics.RUN_CMD, payload });
    }

    restart(payload: IRestartWorkerSubPayload): void {
        this.postMessage({ cmd: WorkerSubTopics.RESTART, payload });
    }
}

export abstract class AbstractWorkerSub<E, M> extends AbstractSub<E, M, IWorkerSubUnion> {
    async routeSwitch(data: IWorkerSubUnion): Promise<void> {
        // tod
        null;
    }
    // [Define for main + worker] One method for each topic
}

// TODO Remove this...
type F = (payload: string) => void;

export abstract class AbstractMainSub<E, M> extends AbstractSub<E, M, IMainSubUnion> {
    async routeSwitch(data: IMainSubUnion): Promise<void> {
        // tod
        null;
    }
    // [Define for main + worker] One method for each topic

    abstract bundle: F;
}

// TODO Decide whether Sub handlers should be passed as callbacks object or require custom class...
