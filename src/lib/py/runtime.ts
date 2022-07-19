import * as pyodidePkg from 'pyodide';
import type {
    IPyconsoleCallbacks,
    IPyodideConsole,
    PyConsoleCallbackPayloads,
    PyodideInterface,
    PyErrors
} from './runtime.types';
import * as pyerrs from './errors';

/**
 * Class that runs the main python thread + manages multiple consoles where actual compute occurs.
 */
export class PyMain {
    consoles: Record<string, PyConsole> = {};

    /**
     * @note PyMain should be initialized from the async "init" command.
     */
    constructor(
        // public client: IPyodideClient,
        public indexURL: string,
        public pyodide: PyodideInterface,
        public consoleCallbacks: IPyconsoleCallbacks // public reprShorten: PyProxy // TODO Type this...Callable.. // public banner: string
    ) {
        // this.client.startup({ status: 'ready' });
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
    async init(
        // client: IPyodideClient,
        indexURL: string,
        consoleCallbacks: IPyconsoleCallbacks
    ): Promise<PyMain> {
        const pyodide: PyodideInterface = await pyodidePkg.loadPyodide({
            indexURL
        });

        // const initRes = pyodide.runPython(PY_MAIN_STARTUP);
        // const banner = initRes['banner'];
        // const reprShorten = initRes['reprShorten'];

        return new PyMain(indexURL, pyodide, consoleCallbacks);
    }

    createConsole(consoleId: string, name: string): PyConsole {
        const c = new PyConsole(consoleId, name, this, this.consoleCallbacks);
        this.consoles[consoleId] = c;
        return c;
        // TODO Notify ready to go.
    }
    // removeConsole(consoleId: string): void {}
    // restartConsole(consoleId: string): void {
    //     // Same as creating new... Just use same id + name.
    // }
}

export class PyConsole {
    pyc: IPyodideConsole;
    _activeCmdId: string | null = null;
    _status: 'starting' | 'inactive' | 'active' = 'starting';

    constructor(
        public id: string,
        public name: string,
        public pyMain: PyMain,
        public callbacks: IPyconsoleCallbacks
    ) {
        // TODO Update init stuff...
        this.pyc = this.pyMain.pyodide.runPython(`PyodideConsole(__main__.__dict__)`);
        this.pyc.stdout_callback = this.handleStdout;
        this.pyc.stderr_callback = this.handleStderr;
        this.activeCmdId = null; // Set status to pending
    }

    public async run(code: string, cmdId: string): Promise<void> {
        this.activeCmdId = cmdId;
        this.callbacks.onStartCmd({
            ...this.callbackPayloadBase,
            datetime: new Date(),
            code: code
        });

        // Wrap full command in command-level state trackers
        const fut = this.pyc.runsource(code);
        try {
            switch (fut.syntax_check) {
                case 'complete':
                    /// ok
                    break;
                case 'syntax-error':
                    throw pyerrs.createPyErrors.createPySyntaxError(fut);
                case 'incomplete':
                    throw pyerrs.createPyErrors.createIncompleteCommandError(fut);
                default:
                    // TODO Handle
                    throw new Error(`Unexpected type ${fut.syntax_check}`);
            }

            // "Complete" case
            const value = await fut;

            console.debug('return value: ', value);

            // TODO Determine what to do here...
            const v = value.toString();
            if (value && this.pyc.isPyProxy(value)) {
                value.destroy();
            }

            this.callbacks.onEndCmd({
                ...this.callbackPayloadBase,
                status: 'ok',
                result: v,
                datetime: new Date()
            });
        } catch (e) {
            console.error('Catching error: ', e);
            let err: PyErrors.TPyError = {
                msg: 'unknown',
                origin: 'console',
                kind: 'UnknownError',
                traceback: '[traceback]'
            };
            if (e instanceof Error) {
                if (e instanceof pyerrs.PyError) {
                    err = e.data;
                } else if (e.constructor.name === 'PythonError') {
                    ///
                    console.error('At python errro');
                } else {
                    console.log(`Unknown error kind: ${e.constructor.name} | `, e);
                }
            } else {
                console.error('Caught non-Error error: ', e);
            }

            this.callbacks.onEndCmd({
                ...this.callbackPayloadBase,
                status: 'err',
                err,
                datetime: new Date()
            });
        } finally {
            fut.destroy();
            this.activeCmdId = null;
        }
    }

    // TODO Determine what to do here. Don't have a million new lines.
    private handleStdout = (e: string) => this.handleOutputStream('stdout')(e);
    private handleStderr = (e: string | Error) => this.handleOutputStream('stderr')(e);
    private handleOutputStream = (stream: 'stdout' | 'stderr') => (e: string | Error) => {
        this.callbacks.onOutput({
            ...this.callbackPayloadBase,
            stream,
            msg: e.toString()
        });
    };

    private get callbackPayloadBase(): PyConsoleCallbackPayloads.IPyConsoleCallbackPayload {
        const cmdId = this.activeCmdId;
        if (cmdId == null) {
            throw new Error('Cannot have tis1=!');
        }

        return {
            consoleId: this.id,
            id: cmdId,
            timestamp: performance.now()
        };
    }

    private set activeCmdId(cmdId: string | null) {
        this._activeCmdId = cmdId;
        this._status = cmdId == null ? 'inactive' : 'active';
    }

    get activeCmdId(): string | null {
        return this._activeCmdId;
    }

    get status() {
        return this._status;
    }
}
