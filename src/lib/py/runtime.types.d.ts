import type { PyProxy } from 'pyodide/pyodide.d';
import * as pyodidePkg from 'pyodide';

export type PyodideInterface = GetInsidePromise<ReturnType<typeof pyodidePkg.loadPyodide>>;

export type PythonError = ValueOf<PyodideInterface, 'PythonError'>;

export interface IConsoleFuture extends Awaited<PyProxy> {
    syntax_check: 'incomplete' | 'syntax-error' | 'complete';
    formatted_error?: string;
}

export interface IPyodideConsole extends PyProxy {
    push(code: string): IConsoleFuture;
    runsource(code: string, filename: string = '<console>'): IConsoleFuture;

    stdout_callback?: (s: string) => void;
    stderr_callback?: (s: string) => void;
}

export namespace PyErrors {
    export type TOrigins = 'main' | 'console' | 'py';

    // TODO Use or lose
    export type TPyError = {
        msg: string;
        origin: TOrigins;
        kind: string;
        traceback: string;
    };

    export interface IPyErrorClass {
        data: TPyError;
    }
}

export namespace PyConsoleCallbackPayloads {
    export type IPyConsoleCallbackPayload = {
        consoleId: string;
        id: string; //command Id
        timestamp: number;
    };

    export type IOutputPayload = IPyConsoleCallbackPayload & {
        stream: 'stdout' | 'stderr';
        msg: string;
    };

    /**
     * Starts executing a passed set of code.
     */
    export type IStartCmdPayload = IPyConsoleCallbackPayload & {
        code: string;
        datetime: Date;
    };

    /**
     * Completes executing a passed set of code.
     */
    export type IEndAbstractCmdPayload = IPyConsoleCallbackPayload & {
        status: 'ok' | 'err';
        result: string;
        err: PyErrors.TPyError;
        datetime: Date;
    };

    /**
     * Completes executing a passed set of code.
     */
    export type IEndOkCmdPayload = Omit<IEndAbstractCmdPayload, 'err'> & {
        status: 'ok';
    };
    export type IEndErrCmdPayload = Omit<IEndAbstractCmdPayload, 'result'> & {
        status: 'err';
    };
}

export interface IPyconsoleCallbacks<
    K extends null | keyof PyConsoleCallbackPayloads.IPyConsoleCallbackPayload = null
> {
    onOutput: (payload: Omit<PyConsoleCallbackPayloads.IOutputPayload, K>) => void;
    onStartCmd: (payload: Omit<PyConsoleCallbackPayloads.IStartCmdPayload, K>) => void;
    onEndCmd: (
        payload:
            | Omit<PyConsoleCallbackPayloads.IEndErrCmdPayload, K>
            | Omit<PyConsoleCallbackPayloads.IEndOkCmdPayload, K>
    ) => void;
}

// export type IPyconsoleCallbacksPartial = IPyconsoleCallbacks<
//     keyof PyConsoleCallbackPayloads.IPyConsoleCallbackPayload
// >;
