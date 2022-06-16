import type { PyProxy } from 'pyodide/pyodide.d';
import type {
    IOutputClientCmdPayload,
    IRunCompleteClientCmdPayload,
    IRunCompleteStatementClientCmdPayload,
    IRunStartClientCmdPayload,
    IRunStartStatementClientCmdPayload,
    IStartupRunClientCmdPayload,
    IWorkerErrorClientCmdPayload
} from '$lib/py/protocol';
import * as pyodidePkg from 'pyodide';

export type PyodideInterface = GetInsidePromise<ReturnType<typeof pyodidePkg.loadPyodide>>;

export type PyInterfaceExtended = PyodideInterface & {
    reprShorten: PyProxy; // TODO Type this...Callable..
    banner: string;
};

export interface IPyConsoleClient {
    output(payload: IOutputClientCmdPayload): void;

    runStart(payload: IRunStartClientCmdPayload): void;
    runComplete(payload: IRunCompleteClientCmdPayload): void; // runFinally?

    runStartStatement(payload: IRunStartStatementClientCmdPayload): void;
    runCompleteStatement(payload: IRunCompleteStatementClientCmdPayload): void;
}

export interface IPyMainClient {
    startup(payload: IStartupRunClientCmdPayload): void;
}

export interface IPyodideClient extends IPyConsoleClient, IPyMainClient {
    workerError(payload: IWorkerErrorClientCmdPayload): void;
}

// TODO Still need these?
export interface IConsoleFuture extends PyProxy {
    syntax_check: 'incomplete' | 'syntax-error' | 'complete';
    formatted_error?: string;
}

export interface IPyodideConsole extends PyProxy {
    push(code: string): IConsoleFuture;
}
