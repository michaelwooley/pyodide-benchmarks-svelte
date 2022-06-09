/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// REFERENCE https://github.com/michaelwooley/pybros/compare/dev...michael/add-pyodide#diff-2aab33c007195065ba916696e692b6850be8ce8ab8d349dd87eed953828ffd71
// All about overlay.ts!!
class HTMLElementFake {}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.HTMLElement = HTMLElementFake;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.customElements = null;

const main = async (): Promise<void> => {
    const pkg = await import('./index'); // Needs to happen after load.
    const interpreterFactory = pkg.interpreterFactory;
    const loadPyodide = pkg.loadPyodide;
    self.postMessage({ kind: 'hello', payload: 'afs' });
    const { banner, pyodide } = await loadPyodide();
    const interp = interpreterFactory({
        pyodide,
        callback: console.log
    });

    self.postMessage({ kind: 'init', payload: banner });
    console.log(interp);

    self.onmessage = function (e) {
        const d = e.data;
        console.log(d);

        if (d.kind === 'exec') {
            console.log('will run this...', pyodide);
        } else {
            console.log("can't handle this gut.");
        }
    };
};

main();

export {};
