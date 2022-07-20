/// <reference no-default-lib="false"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// HACK All about overlay.ts in vite
// REFERENCE https://github.com/michaelwooley/pybros/compare/dev...michael/add-pyodide#diff-2aab33c007195065ba916696e692b6850be8ce8ab8d349dd87eed953828ffd71
class HTMLElementFake {}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.HTMLElement = HTMLElementFake;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.customElements = null;

/**
 *
 * ACTUAL WORKER
 *
 */

const main = async (): Promise<void> => {
    const workerWrapper = await (await import('./worker.lib')).workerWrapper; // Needs to happen after load.
    const handleMessage = await workerWrapper(self.postMessage);
    self.onmessage = handleMessage;
};

main();

export {};
