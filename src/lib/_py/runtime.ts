/**
 * Python runtime logic.
 *
 * Agnostic w.r.t. communications protocol. (e.g. web worker v. main thread)
 */
import type { PyProxy } from 'pyodide';
import * as pyodidePkg from 'pyodide';
import type { IPyError } from './protocol';
import type {
    IConsoleFuture,
    IPyConsoleClient,
    IPyodideClient,
    IPyodideConsole,
    PyInterfaceExtended,
    PyodideInterface
} from '$lib/_py/py.types';

const PY_MAIN_STARTUP = `
import sys
from pyodide.console import PyodideConsole, BANNER, repr_shorten
import __main__
# pyconsole = PyodideConsole(__main__.__dict__)

# return value
# sys.version
{"banner": BANNER, "reprShorten": repr_shorten}
`;

export class PySyntaxError extends Error {
    line: number;
    traceback: string;

    constructor(traceback: string, line: number) {
        super('SyntaxError');
        this.traceback = traceback;
        this.line = line;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, PySyntaxError.prototype);
    }

    static fromFuture(fut: IConsoleFuture, line: number): PySyntaxError {
        return new PySyntaxError(
            (fut.formatted_error || `Unknown SyntaxError @ line ${line}`).trim(),
            line
        );
    }
}

/**
 * Class that runs the main python thread + manages multiple consoles where actual compute occurs.
 */
class PyMain {
    consoles: Record<string, PyConsole> = {};

    /**
     * @note PyMain should be initialized from the async "init" command.
     */
    constructor(
        public client: IPyodideClient,
        public indexURL: string,
        public pyodide: PyInterfaceExtended,
        public banner: string,
        public reprShorten: PyProxy // TODO Type this...Callable..
    ) {
        this.client.startup({ status: 'ready' });
    }

    /**
     * !!! Should be used to create `PyMain`
     *
     * Actually runs startup commands for the main-thread python process.
     *
     * @param client A class that can be used to handle outgoing communication from events. (Not just WebWorker/postMessage necessarily.)
     * @param indexURL Load URL for actual pyodide wasm + pack files.
     * @returns A promise returning the `PyMain` instance
     */
    async init(client: IPyodideClient, indexURL: string): Promise<PyMain> {
        const pyodide: PyodideInterface = await pyodidePkg.loadPyodide({
            indexURL
        });

        const initRes = pyodide.runPython(PY_MAIN_STARTUP);
        const banner = initRes['banner'];
        const reprShorten = initRes['reprShorten'];

        return new PyMain(
            client,
            indexURL,
            {
                ...pyodide,
                banner: initRes['banner'],
                reprShorten: initRes['reprShorten']
            },
            banner,
            reprShorten
        );
    }

    // TODO Add status callbacks for these
    createConsole(consoleId: string, name: string): void {
        const c = new PyConsole(consoleId, name, this, this.client);
        this.consoles[consoleId] = c;
        // TODO Notify ready to go.
    }
    // removeConsole(consoleId: string): void {}
    // restartConsole(consoleId: string): void {
    //     // Same as creating new... Just use same id + name.
    // }

    // TODO Add FS handling...
    // TODO Add interrupts
}

/**
 * Python REPL that fields actual user commands.
 *
 * Created and managed by `PyMain`
 *
 * _Can_ be instantiated via normal `new PyConsole(...)` method.
 */
class PyConsole {
    pyc: IPyodideConsole;
    activeCommandId: '<inactive>' | string = '<inactive>'; // QUESTION Switch to some other form? Like string | false

    constructor(
        public id: string,
        public name: string,
        public pyMain: PyMain,
        public client: IPyConsoleClient
    ) {
        this.pyc = this.pyMain.pyodide.runPython(`PyodideConsole(__main__.__dict__)`);
        this.pyc.stdout_callback = this.handleStdout;
        this.pyc.stderr_callback = this.handleStderr;
        // TODO Console ready callback
    }

    // TODO Add console-specific code completion
    // codeComplete(command: string): void {}

    async run(command: string, commandId: string): Promise<void> {
        try {
            this.setActiveCommandId(commandId);
            // Wrap full command in command-level state trackers
            this.client.runStart({
                consoleId: this.id,
                id: commandId,
                code: command
            });
            await this._run(command, commandId);
            this.client.runComplete({
                consoleId: this.id,
                id: commandId,
                status: 'ok'
            });
        } catch (e) {
            // HANDLE THE ERRORS
            let err: IPyError;
            if (!(e instanceof Error)) {
                err = {
                    kind: 'UnknownThrow',
                    msg: 'Encountered unknown error.',
                    traceback: `${e}`
                };
            } else if (e.constructor.name === 'PythonError') {
                err = {
                    kind: 'PythonError',
                    msg: 'Encountered unknown error.',
                    traceback: this.pyc.formattraceback(e).trimEnd()
                };
            } else if (e.constructor.name === 'SyntaxError') {
                err = {
                    kind: 'SyntaxError',
                    msg: 'SyntaxError',
                    traceback: this.pyc.formattraceb
                };
            } else {
                err = {
                    kind: 'Error',
                    msg: e.msg,
                    traceback: e.stack || '[no traceback]'
                };
            }

            this.client.runComplete({
                consoleId: this.id,
                id: commandId,
                status: 'err',
                err
            });
        } finally {
            this.unsetActiveCommandId();
        }
    }

    async _run(command: string, commandId: string): Promise<void> {
        let startLine = 0,
            endLine = 0,
            nStatements = 0;

        for (const c of command.split('\n')) {
            endLine += 1;
            const fut = this.pyc.push(c);
            switch (fut.syntax_check) {
                case 'syntax-error':
                    throw PySyntaxError.fromFuture(fut, startLine);
                case 'complete':
                    this.client.runStartStatement({
                        consoleId: this.id,
                        id: commandId,
                        lines: { start: startLine, end: endLine },
                        n: nStatements
                    });
                    break;
                case 'incomplete':
                    continue;
                default:
                    throw new Error(`Unexpected type ${fut.syntax_check}`);
            }

            try {
                const value = await fut;

                // TODO Determine what to do here...
                const v = value.toString();
                if (value && this.pyc.isPyProxy(value)) {
                    value.destroy();
                }

                this.client.runCompleteStatement({
                    consoleId: this.id,
                    id: commandId,
                    n: nStatements,
                    lines: { start: startLine, end: endLine },
                    returns: v
                });
            } finally {
                fut.destroy();
            }

            // Update trackers for next statement
            startLine = endLine + 1;
            nStatements += 1;
        }

        // Never wrote out something that could be executed.
        if (nStatements === 0) {
            throw new PySyntaxError('Statement is incomplete.', startLine);
        }
    }

    handleStdout(s: string) {
        // TODO Determine what to do here. Don't have a million new lines.
        const msg = s;
        this.client.output({
            consoleId: this.id,
            id: this.activeCommandId,
            stream: 'stdout',
            msg: msg
        });
    }

    handleStderr(e: string | Error) {
        const msg = e.toString();
        this.client.output({
            consoleId: this.id,
            id: this.activeCommandId,
            stream: 'stdout',
            msg: msg
        });
    }

    private get reprShorten(): PyProxy {
        // TODO Use this in stdout/stderr again.
        return this.pyc.pyodide.reprShorten;
    }

    private setActiveCommandId(commandId: string): void {
        this.activeCommandId = commandId;
    }

    private unsetActiveCommandId(): void {
        this.activeCommandId = '<inactive>';
    }
}
