/**
 * Imports + initializes worker module from main thread.
 */

import PyWorker from './worker?worker';

export const initPyWorker = async (): Promise<{
    worker: Worker;
    client: (cmd: string) => void;
}> => {
    // const PyWorker = await import('./worker.ts?worker');
    const worker = new PyWorker();
    worker.onmessage = (e) => {
        console.log('Worker msg:', e.data);
    };
    worker.onerror = (e) => {
        console.error('Worker msg:', e);
    };

    const client = (cmd: string) => worker.postMessage({ kind: 'exec', cmd });

    return { worker, client };
};
