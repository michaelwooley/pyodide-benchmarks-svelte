/**
 * Code for worker: Import  bare min to worker proper.
 */

import { PYODIDE_INDEX_URL } from '$lib/constants';
import { nanoid } from 'nanoid';
import type { IPyconsoleCallbacks, PyConsoleCallbackPayloads } from './runtime.types.d';
import { PyMain } from './runtime';

type IPostMessage = Worker['postMessage'];
type IOnMessage = Exclude<WindowEventHandlers['onmessage'], null>;

const createConsoleCallbacks = (postMessage: IPostMessage): IPyconsoleCallbacks => {
    const _post = (
        kind: string,
        payload: PyConsoleCallbackPayloads.IPyConsoleCallbackPayload
    ): void => postMessage({ kind, payload });
    return {
        // _post: (kind: string, payload: PyConsoleCallbackPayloads.IPyConsoleCallbackPayload): void =>
        //     postMessage({ kind, payload }),
        onOutput: (payload) => _post('output', payload),
        onStartCmd: (payload) => _post('start', payload),
        onEndCmd: (payload) => _post('end', payload)
    } as IPyconsoleCallbacks;
};

/**
 * Actual code for running pyodide in web worker.
 *
 * @param postMessage Method passed in from worker that can handle comms across threads.
 * @returns A function suitable for use in
 */
export const workerWrapper = async (postMessage: IPostMessage): Promise<IOnMessage> => {
    postMessage({ kind: 'hello', payload: 'afs' });
    const consoleCallbacks = createConsoleCallbacks(postMessage);

    const py = await PyMain.init(PYODIDE_INDEX_URL, consoleCallbacks);
    const csl = py.createConsole('0', 'OG');
    csl.run("print('Ready to go')", nanoid());

    const fn = (e: MessageEvent<any>) => {
        const d = e.data;
        console.log(d);

        if (d.kind === 'exec') {
            console.log('will run this...', d);
        } else {
            console.log("can't handle this guy :/");
        }
    };

    return fn;
};
