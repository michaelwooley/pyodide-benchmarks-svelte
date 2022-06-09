/**
 * Pyodide handlers
 */

import { PYODIDE_INDEX_URL } from '$lib/constants';
import * as pyodide_pkg from 'pyodide';

export async function loadPyodide() {
    // const pyodide_pkg = await import('pyodide');
    const pyodide = await pyodide_pkg.loadPyodide({
        indexURL: PYODIDE_INDEX_URL
    });

    pyodide.runPython(`
        import js
        main_div = js.document.getElementById("status")
        if main_div:
          main_div.innerHTML = "Loaded!"
        div = js.document.createElement("div")
        div.innerHTML = "<h1>Hello Pyodide! This element was created from Python</h1>"
        js.document.body.prepend(div)
    `);
}
