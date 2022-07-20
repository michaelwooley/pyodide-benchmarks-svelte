/**
 * Imports + initializes worker module from main thread.
 */

import PyWorker from './worker.ts?worker';

// import { getBrowserName } from '$lib/util';
// if (import.meta.env && getBrowserName() !== 'Chrome') {
//     alert('Chrome is required in dev mode! Handling of imports in web workers is the issue!');
//     return;
// }

export const initPyWorker = async (): Promise<{
    worker: Worker;
    client: (cmd: string) => void;
}> => {
    // const PyWorker = await import('./worker.ts?worker');
    const worker = new PyWorker();
    worker.onmessage = (e) => {
        console.log('Worker msg:', e.data);
    };

    const client = (cmd: string) => worker.postMessage({ kind: 'exec', cmd });

    return { worker, client };
};
