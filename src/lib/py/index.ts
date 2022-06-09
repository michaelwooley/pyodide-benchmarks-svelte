/**
 * Pyodide handlers
 */

import { PYODIDE_INDEX_URL } from '$lib/constants';
import * as pyodidePkg from 'pyodide';

export async function loadPyodide() {
    // const pyodidePkg = await import('pyodide'); // Really need here?
    const pyodide = await pyodidePkg.loadPyodide({
        indexURL: PYODIDE_INDEX_URL,
        stdout: console.info,
        stderr: console.warn
    });

    const banner: string = pyodide.runPython(
        `
    import sys
    from pyodide.console import PyodideConsole, BANNER
    import __main__
    pyconsole = PyodideConsole(__main__.__dict__)

    # return value
    # sys.version
    BANNER #{"banner": BANNER}
    `
    );

    return banner;
}
