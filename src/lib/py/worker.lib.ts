import { PYODIDE_INDEX_URL } from '$lib/constants';
import { nanoid } from 'nanoid';
import type { IPyconsoleCallbacks, PyConsoleCallbackPayloads } from './runtime.types.d';
import { PyMain } from './runtime';

type IPostMessage = Worker['postMessage'];
type IOnMessage = Worker['onmessage'];

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

export const workerWrapper = (postMessage: IPostMessage) => async (): Promise<IOnMessage> => {
    postMessage({ kind: 'hello', payload: 'afs' });
    const consoleCallbacks = createConsoleCallbacks(postMessage);

    const py = await PyMain.init(PYODIDE_INDEX_URL, consoleCallbacks);
    const csl = py.createConsole('0', 'OG');
    csl.run("print('Ready to go')", nanoid());

    postMessage({ kind: 'init', payload: 'Ready to go!' });

    const fn = function (e: MessageEvent<any>) {
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
