import type { PyProxy } from 'pyodide/pyodide.d';
import type {
    IOutputMainSubPayload,
    IRunCompleteMainSubPayload,
    IRunCompleteStatementMainSubPayload,
    IRunStartMainSubPayload,
    IRunStartStatementMainSubPayload,
    IStartupMainSubPayload,
    IWorkerErrorMainSubPayload
} from '$lib/py/protocol';
import * as pyodidePkg from 'pyodide';

export type PyodideInterface = GetInsidePromise<ReturnType<typeof pyodidePkg.loadPyodide>>;

export type PyInterfaceExtended = PyodideInterface & {
    reprShorten: PyProxy; // TODO Type this...Callable..
    banner: string;
};

/**
 * Outgoing messages
 * Used by: `PyConsole`
 */
export interface IPyConsoleClient {
    output(payload: IOutputMainSubPayload): void;

    runStart(payload: IRunStartMainSubPayload): void;
    runComplete(payload: IRunCompleteMainSubPayload): void; // runFinally?

    runStartStatement(payload: IRunStartStatementMainSubPayload): void;
    runCompleteStatement(payload: IRunCompleteStatementMainSubPayload): void;
}

/**
 * Outgoing messages
 * Used by: `PyMain`
 */
export interface IPyMainClient {
    startup(payload: IStartupMainSubPayload): void;
}

/**
 * Outgoing messages
 * Combined class for runtime clases.
 */
export interface IPyodideClient extends IPyConsoleClient, IPyMainClient {
    // QUESTION Is workerError appropriate if trying to be agnostic w.r.t. runtime?
    workerError(payload: IWorkerErrorMainSubPayload): void;
}

// TODO Still need these?
export interface IConsoleFuture extends PyProxy {
    syntax_check: 'incomplete' | 'syntax-error' | 'complete';
    formatted_error?: string;
}

export interface IPyodideConsole extends PyProxy {
    push(code: string): IConsoleFuture;
}
