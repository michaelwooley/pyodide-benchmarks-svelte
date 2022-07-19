import type { IConsoleFuture, PyErrors } from './runtime.types';

export class PyError extends Error implements PyErrors.IPyErrorClass {
    constructor(public data: PyErrors.TPyError) {
        super(data.msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, PyError.prototype);
    }
}

export const createPyErrors = {
    createPySyntaxError: (fut: IConsoleFuture) =>
        new PyError({
            msg: 'SyntaxError: invalid syntax',
            kind: 'SyntaxError',
            traceback: fut.formatted_error || `Unknown SyntaxError`,
            origin: 'console'
        }),
    createIncompleteCommandError: (fut: IConsoleFuture) =>
        new PyError({
            msg: 'IncompleteCommandError: command is incomplete',
            kind: 'IncompleteCommandError',
            traceback: fut.formatted_error || `IncompleteCommandError`,
            origin: 'console'
        })
};

// export class PySyntaxError extends PyError {
//     constructor(fut: IConsoleFuture) {
//         super({
//             msg: 'SyntaxError: invalid syntax',
//             kind: 'SyntaxError',
//             traceback: fut.formatted_error || `Unknown SyntaxError`,
//             origin: 'console'
//         });
//         // Set the prototype explicitly.
//         Object.setPrototypeOf(this, PySyntaxError.prototype);
//     }
// }

// export class IncompleteCommandError extends PyError {
//     constructor(fut: IConsoleFuture) {
//         super({
//             msg: 'IncompleteCommandError: command is incomplete',
//             kind: 'IncompleteCommandError',
//             traceback: fut.formatted_error || `IncompleteCommandError`,
//             origin: 'console'
//         });
//         // Set the prototype explicitly.
//         Object.setPrototypeOf(this, IncompleteCommandError.prototype);
//     }
// }
// PythonError
// ConversionError // https://pyodide.org/en/stable/usage/api/python-api.html#pyodide.ConversionError
// JsException

// export class PyConsoleRunError extends PyError {
//     constructor(e: PythonError) {
//         super({
//             msg: 'IncompleteCommandError: command is incomplete',
//             kind: 'IncompleteCommandError',
//             traceback: fut.formatted_error || `IncompleteCommandError`,
//             origin: 'python'
//         });
//         // Set the prototype explicitly.
//         Object.setPrototypeOf(this, PyConsoleRunError.prototype);
//     }
// }
