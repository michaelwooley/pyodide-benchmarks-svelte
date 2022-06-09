/**
 * Pyodide handlers
 */

import { PYODIDE_INDEX_URL } from '$lib/constants';
import * as pyodidePkg from 'pyodide';

export async function loadPyodide() {
    const pyodide = await pyodidePkg.loadPyodide({
        indexURL: PYODIDE_INDEX_URL,
        stdout: console.info,
        stderr: console.warn
    });

    const out = pyodide.runPython(`
    import sys
    from pyodide.console import PyodideConsole, repr_shorten, BANNER
    import __main__
    pyconsole = PyodideConsole(__main__.__dict__)
    {"banner": BANNER}
    `);

    // const out = pyodide.runPython(`
    //     import js
    //     main_div = js.document.getElementById("status")
    //     if main_div:
    //       main_div.innerHTML = "Loaded!"
    //     div = js.document.createElement("div")
    //     div.innerHTML = "<h1>Hello Pyodide! This element was created from Python</h1>"
    //     js.document.body.prepend(div)

    //     print("from stdout!")

    //     "here"
    // `);

    console.log('output: ', out.toJs());
}
