/**
 * Pyodide handlers
 */

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

    // const pyc: pyodidePkg.PyProxy = pyodide.runPython(`pyconsole`);
    // pyc.stdout_callback = (s) => console.info(`pyc: (${s.charCodeAt(0)}) '${s}'`);
    // pyc.stderr_callback = (s) => console.error('pyc stderr: (${s.charCodeAt(0)}) ', s);
    // console.log('Python console: ', pyc);
    // console.log('Trying to run some stuff..');
    // console.dir(pyc);
    // // const fut = pyc.push('raise Exception("an error")');
    // // const fut = pyc.push('1+1');
    // // NOTE Can only run one statement at a time here! Need to check
    // await pyc.push('my_var=3');
    // let comp = pyc.complete('my_v');
    // console.log(comp.toJs(), comp.isIterable());

    // let fut = pyc.push('my_v= \\');
    // console.log(fut.syntax_check, fut.formatted_error);
    // // const fut = pyc.runsource(`
    // // a = 3;print(BANNER);print("something else")
    // // #print(2* 2)
    // // # raise Exception("aaa")
    // // #1+1`);

    // // console.log(fut.syntax_check);
    // // console.log(fut.formatted_error);
    // // console.log(fut.toString());
    // fut.finally((...out) => console.log('Done w/ command: ', out)).catch((e) => {
    //     console.error(e.message);
    //     const jse = pyc.formattraceback(e);
    //     console.warn(jse);
    //     console.dir(e);
    //     // console.info(fut.formatted_error);
    // });
    // await pyc.push('4*4');
    // // pyc.push('print("first time: ",a, end=" | ")');
    // // pyodide.runPythonAsync('print(a)').catch(console.warn).then(console.info);

    // fut = pyc.push('4*4');
    // console.log(fut.syntax_check, fut.formatted_error);
    // const value = await fut;
    // console.log(value);

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
