/**
 * Communication protocol/routes/handlers between the worker and main [threads].
 *
 * NOTE The protocol states everything in terms of messages that a thread _SUBSCRIBES_ to. However, could just as easily flip around and state in terms of messages that a given thread _PUBLISHES_ to. So `WorkerSubTopics` becomes `MainPubTopics`, `IOutputMainSub` becomes `IOutputWorkerPub`
 *
 */

/**
 * // TODO #16 Delete this in favor of returning actual errors.
 */
export interface IPyError {
    msg: string;
    traceback: string;
    kind: 'PythonError' | 'SyntaxError' | 'WorkerError' | 'Error' | 'UnknownThrow';
}

/**
 * Worker receives these messages from main thread.
 *
 * Worker thread subscribes to (and handles) these topics/routes.
 * Main thread publishes to these topics/routes.
 */
export enum WorkerSubTopics {
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
 * Main receives these messages from worker thread.
 *
 * Worker thread publishes to these topics/routes.
 * Main thread subscribes to (and handles) these topics/routes.
 */
export enum MainSubTopics {
    STARTUP, // Signal sent when interpreter is ready to start
    // SHUTDOWN,

    OUTPUT, // stderr+stdout streams. Return valuen returned in RUN*_COMPLETE.

    RUN_START, // Start: Python cmd run (all lines containing perhaps multiple statements)
    RUN_COMPLETE, // Complete: Python cmd run w/ return value (thrown errors?)

    RUN_START_STATEMENT, // Start: One logical statement w/in larger command
    RUN_COMPLETE_STATEMENT, // Complete: Python cmd run w/ return value (thrown errors?)

    WORKER_ERROR // Worker-level error. Distinct from console errors.

    // ADD_CONSOLE_CALLBACK, // Response once added console.
    // REMOVE_CONSOLE_CALLBACK, // Response once removed console.
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IAbstractSubPayload {}

interface PyodideCmdData<C extends number, P extends IAbstractSubPayload> {
    cmd: C; // Command to be carried out by counterparty/
    payload: P; // Command-specific data.
}

// ////////////////////////////////////////
//  WORKER COMMANDS
// ////////////////////////////////////////

export type IAbstractWorkerSub<
    C extends WorkerSubTopics,
    P extends IAbstractSubPayload
> = PyodideCmdData<C, P>;

/****************************************************************
 * RUN_CMD
 ****************************************************************/
export interface IRunWorkerSubPayload extends IAbstractSubPayload {
    consoleId: string; // use nanoid
    id: string; // use nanoid
    code: string;
    // context: Record<string, any>;
}

export type IRunWorkerSub = IAbstractWorkerSub<WorkerSubTopics.RUN_CMD, IRunWorkerSubPayload>;

/****************************************************************
 * RESTART
 ****************************************************************/

export interface IRestartWorkerSubPayload extends IAbstractSubPayload {
    consoleId?: string; // TODO Make non-optional once have multiple consoles
}

export type IRestartWorkerSub = IAbstractWorkerSub<
    WorkerSubTopics.RESTART,
    IRestartWorkerSubPayload
>;

export type IWorkerCmdsUnion = IRunWorkerSub | IRestartWorkerSub;

// ////////////////////////////////////////
//  CLIENT COMMANDS
// ////////////////////////////////////////

export type IAbstractMainSub<
    C extends MainSubTopics,
    P extends IAbstractSubPayload
> = PyodideCmdData<C, P>;

/****************************************************************
 * STARTUP
 ****************************************************************/

export interface IStartupMainSubPayload extends IAbstractSubPayload {
    status: 'ready' | 'failed';
    err?: Error;
    // consoleId: string; // TODO Differentiate between top-level and console startup. Different implications.
    // interruptBuffer: TypedArray;
}

export type IStartupMainSub = IAbstractMainSub<MainSubTopics.STARTUP, IStartupMainSubPayload>;

/****************************************************************
 * OUTPUT
 ****************************************************************/

export interface IOutputMainSubPayload extends IAbstractSubPayload {
    consoleId: string;
    id: string;
    stream: 'stdout' | 'stderr'; // TODO Handle final return specialness
    msg: string;
}

export type IOutputMainSub = IAbstractMainSub<MainSubTopics.OUTPUT, IOutputMainSubPayload>;

/****************************************************************
 * RUN_START
 ****************************************************************/

export interface IRunStartMainSubPayload extends IAbstractSubPayload {
    consoleId: string;
    id: string;
    code: string;
    // perf: {} // TODO Add in performance stats
}

export type IRunStartMainSub = IAbstractMainSub<MainSubTopics.RUN_START, IRunStartMainSubPayload>;

/****************************************************************
 * RUN_COMPLETE
 ****************************************************************/

export interface IRunCompleteMainSubPayload extends IAbstractSubPayload {
    consoleId: string;
    id: string;
    status: 'ok' | 'err'; // QUESTION Where do errors go???
    // returns?: unknown;
    err?: IPyError;
}

export type IRunCompleteMainSub = IAbstractMainSub<
    MainSubTopics.RUN_COMPLETE,
    IRunCompleteMainSubPayload
>;

/****************************************************************
 * RUN_START_STATEMENT
 ****************************************************************/

export interface IRunStartStatementMainSubPayload extends IAbstractSubPayload {
    consoleId: string;
    id: string;
    n: number; // Statement index
    lines: {
        start: number;
        end: number;
    };
}

export type IRunStartStatementMainSub = IAbstractMainSub<
    MainSubTopics.RUN_START_STATEMENT,
    IRunStartStatementMainSubPayload
>;

/****************************************************************
 * RUN_COMPLETE_STATEMENT
 ****************************************************************/

export interface IRunCompleteStatementMainSubPayload extends IAbstractSubPayload {
    consoleId: string;
    id: string;
    n: number; // Statement index
    lines: {
        start: number;
        end: number;
    };
    returns?: unknown; // TODO Pin this down...
}

export type IRunCompleteStatementMainSub = IAbstractMainSub<
    MainSubTopics.RUN_COMPLETE_STATEMENT,
    IRunCompleteStatementMainSubPayload
>;

/****************************************************************
 * WORKER_ERROR
 ****************************************************************/

export interface IWorkerErrorMainSubPayload extends IAbstractSubPayload {
    err: IPyError;
}

export type IWorkerErrorMainSub = IAbstractMainSub<
    MainSubTopics.WORKER_ERROR,
    IWorkerErrorMainSubPayload
>;

export type IMainSubUnion =
    | IStartupMainSub
    | IOutputMainSub
    | IRunStartMainSub
    | IRunCompleteMainSub
    | IRunStartStatementMainSub
    | IRunCompleteStatementMainSub
    | IWorkerErrorMainSub;
