/**
 * Communication protocol/routes/handlers between the worker and client.
 */

/**
 * // TODO Delete this in favor of returning actual errors.
 */
export interface IPyError {
    msg: string;
    traceback: string;
    kind: 'PythonError' | 'SyntaxError' | 'WorkerError' | 'Error' | 'UnknownThrow';
}

/**
 * Commands recieved BY worker FROM client.
 */
export enum WorkerCmdEnum {
    RUN_CMD, // Run a python command
    // RUN_SCRIPT, // TODO Run a python script (work out FS, etc.)
    // LOAD_PACKAGE, // Load a py package from... (work out details of pypi v. pkg w/ c bindings.)
    // LIST_PACKAGES, // List packages active/available in env.
    // VIEW_ENV, // List active objects in env.
    RESTART // Restart/reset the python console
    // ADD_CONSOLE, // Add console, returning ID
    // REMOVE_CONSOLE, // Remove console by ID
}

/**
 * Commands recieved BY client FROM worker.
 */
export enum ClientCmdEnum {
    STARTUP, // Signal sent when interpreter is ready to start
    // SHUTDOWN,

    OUTPUT, // stderr+stdout streams. Return valuen returned in RUN*_COMPLETE.
    RUN_START, // Start: Python cmd run
    RUN_COMPLETE, // Complete: Python cmd run w/ return value (thrown errors?)

    RUN_START_STATEMENT, // Start: Python cmd run
    RUN_COMPLETE_STATEMENT, // Complete: Python cmd run w/ return value (thrown errors?)

    WORKER_ERROR // Worker-level error. Distinct from console errors.

    // ADD_CONSOLE_CALLBACK, // Response once added console.
    // REMOVE_CONSOLE_CALLBACK, // Response once removed console.
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PyodideCmdDataPayload {}

interface PyodideCmdData<C extends number, P extends PyodideCmdDataPayload> {
    cmd: C; // Command to be carried out by counterparty/
    payload: P; // Command-specific data.
}

// ////////////////////////////////////////
//  WORKER COMMANDS
// ////////////////////////////////////////

export type WorkerCmdData<
    C extends WorkerCmdEnum,
    P extends PyodideCmdDataPayload
> = PyodideCmdData<C, P>;

/****************************************************************
 * RUN_CMD
 ****************************************************************/
export interface IRunCmdWorkerCmdPayload extends PyodideCmdDataPayload {
    consoleId: string; // use nanoid
    id: string; // use nanoid
    code: string;
    // context: Record<string, any>;
}

export type IRunCmdWorkerCmd = WorkerCmdData<WorkerCmdEnum.RUN_CMD, IRunCmdWorkerCmdPayload>;

/****************************************************************
 * RESTART
 ****************************************************************/

export interface IRestartWorkerCmdPayload extends PyodideCmdDataPayload {
    consoleId?: string; // TODO Make non-optional once have multiple consoles
}

export type IRestartWorkerCmd = WorkerCmdData<WorkerCmdEnum.RESTART, IRestartWorkerCmdPayload>;

export type IWorkerCmdsUnion = IRunCmdWorkerCmd | IRestartWorkerCmd;

// ////////////////////////////////////////
//  CLIENT COMMANDS
// ////////////////////////////////////////

export type ClientCmdData<
    C extends ClientCmdEnum,
    P extends PyodideCmdDataPayload
> = PyodideCmdData<C, P>;

/****************************************************************
 * STARTUP
 ****************************************************************/

export interface IStartupRunClientCmdPayload extends PyodideCmdDataPayload {
    status: 'ready' | 'failed';
    err?: Error;
    // consoleId: string; // TODO Differentiate between top-level and console startup. Different implications.
    // interruptBuffer: TypedArray;
}

export type IStartupRunClientCmd = ClientCmdData<
    ClientCmdEnum.STARTUP,
    IStartupRunClientCmdPayload
>;

/****************************************************************
 * OUTPUT
 ****************************************************************/

export interface IOutputClientCmdPayload extends PyodideCmdDataPayload {
    consoleId: string;
    id: string;
    stream: 'stdout' | 'stderr'; // TODO Handle final return specialness
    msg: string;
}

export type IOutputClientCmd = ClientCmdData<ClientCmdEnum.OUTPUT, IOutputClientCmdPayload>;

/****************************************************************
 * RUN_START
 ****************************************************************/

export interface IRunStartClientCmdPayload extends PyodideCmdDataPayload {
    consoleId: string;
    id: string;
    code: string;
    // perf: {} // TODO Add in performance stats
}

export type IRunStartClientCmd = ClientCmdData<ClientCmdEnum.RUN_START, IRunStartClientCmdPayload>;

/****************************************************************
 * RUN_COMPLETE
 ****************************************************************/

export interface IRunCompleteClientCmdPayload extends PyodideCmdDataPayload {
    consoleId: string;
    id: string;
    status: 'ok' | 'err'; // QUESTION Where do errors go???
    // returns?: unknown;
    err?: IPyError;
}

export type IRunCompleteClientCmd = ClientCmdData<
    ClientCmdEnum.RUN_COMPLETE,
    IRunCompleteClientCmdPayload
>;

/****************************************************************
 * RUN_START_STATEMENT
 ****************************************************************/

export interface IRunStartStatementClientCmdPayload extends PyodideCmdDataPayload {
    consoleId: string;
    id: string;
    n: number; // Statement index
    lines: {
        start: number;
        end: number;
    };
}

export type IRunStartStatementClientCmd = ClientCmdData<
    ClientCmdEnum.RUN_START_STATEMENT,
    IRunStartStatementClientCmdPayload
>;

/****************************************************************
 * RUN_COMPLETE_STATEMENT
 ****************************************************************/

export interface IRunCompleteStatementClientCmdPayload extends PyodideCmdDataPayload {
    consoleId: string;
    id: string;
    n: number; // Statement index
    lines: {
        start: number;
        end: number;
    };
    returns?: unknown; // TODO Pin this down...
}

export type IRunCompleteStatementClientCmd = ClientCmdData<
    ClientCmdEnum.RUN_COMPLETE_STATEMENT,
    IRunCompleteStatementClientCmdPayload
>;

/****************************************************************
 * WORKER_ERROR
 ****************************************************************/

export interface IWorkerErrorClientCmdPayload extends PyodideCmdDataPayload {
    err: IPyError;
}

export type IWorkerErrorClientCmd = ClientCmdData<
    ClientCmdEnum.WORKER_ERROR,
    IWorkerErrorClientCmdPayload
>;

export type IClientCmdsUnion =
    | IStartupRunClientCmd
    | IOutputClientCmd
    | IRunStartClientCmd
    | IRunCompleteClientCmd
    | IWorkerErrorClientCmd;
