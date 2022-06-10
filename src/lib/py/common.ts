import { PYODIDE_INDEX_URL } from '$lib/constants';
import * as pyodidePkg from 'pyodide';

export type PyodideInterface = GetInsidePromise<ReturnType<typeof pyodidePkg.loadPyodide>>;

export async function loadPyodide() {
    // const pyodidePkg = await import('pyodide'); // Really need here?
    const pyodide: PyodideInterface = await pyodidePkg.loadPyodide({
        indexURL: PYODIDE_INDEX_URL,
        stdout: console.info,
        stderr: console.warn
    });

    const banner: string = pyodide.runPython(
        `
    import sys
    from pyodide.console import PyodideConsole, BANNER,repr_shorten
    import __main__
    pyconsole = PyodideConsole(__main__.__dict__)

    # return value
    # sys.version
    BANNER #{"banner": BANNER}
    `
    );

    return { banner, pyodide };
}

export const interpreterFactory = ({
    pyodide,
    callback
}: // Command start + finish callbacks
{
    pyodide: PyodideInterface;
    callback: (s: string, kind: 'cmd' | 'stdout' | 'stderr') => void;
}) => {
    const pyconsole: pyodidePkg.PyProxy = pyodide.runPython(`pyconsole`);
    const reprShorten: pyodidePkg.PyProxy = pyodide.runPython(`repr_shorten`);

    const handleStdout = (s: string, alwaysShorten: boolean): void => {
        let ss = s;
        if (alwaysShorten || s.length > 1000) {
            ss = reprShorten.callKwargs(s, {
                separator: '\n[[;orange;]<long output truncated>]\n'
            });
        }
        callback(ss, 'stdout');
        // console.info(`pyc: (len=${s.length}) '${ss}'`);
    };
    const handleStderr = (s: string): void => {
        let ss = s;
        if (s.length > 1000) {
            ss = reprShorten.callKwargs(s, {
                separator: '\n[[;orange;]<long output truncated>]\n'
            });
        }
        callback(ss, 'stderr');
        // console.error(`pyc stderr: (len=${s.length})  ${ss}`);
    };
    pyconsole.stdout_callback = (s: string): void => handleStdout(s, false);
    pyconsole.stderr_callback = handleStderr;

    return async (command: string): Promise<void> => {
        let line = '';
        for (const c of command.split('\n')) {
            line += c;
            const fut = pyconsole.push(c);
            // console.log(fut);
            switch (fut.syntax_check) {
                case 'syntax-error':
                    handleStderr(fut.formatted_error.trimEnd());
                    line = '';
                    continue;
                case 'complete':
                    console.log(line);
                    callback(line, 'cmd');
                    line = '';
                    break;
                case 'incomplete':
                    line += '\n';
                    continue;
                default:
                    throw new Error(`Unexpected type ${fut.syntax_check}`);
            }

            try {
                const value = await fut;
                if (value !== undefined) {
                    handleStdout(value, true);
                }
                if (pyodide.isPyProxy(value)) {
                    value.destroy();
                }
            } catch (e) {
                if (!(e instanceof Error)) {
                    throw new Error(`Bad e: ${e}`);
                }
                if (e.constructor.name === 'PythonError') {
                    const message = pyconsole.formattraceback(e).trimEnd();

                    callback(message, 'stderr');
                } else {
                    throw e;
                }
            } finally {
                // wrapper.destroy();
                fut.destroy();
            }
        }
    };
};
