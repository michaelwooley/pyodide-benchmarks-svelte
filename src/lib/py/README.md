# pyodide adapters

Initial work based off of what was happening in [`michaelwooley/pybros/michael/add-pyodide`](https://github.com/michaelwooley/pybros/tree/0a97fa9448c8c0738e631e16664c4ed9f8e608c6/src/lib/pyodide).

```bash
❯ cd src/lib/py
❯ tree
.
├── common.ts              # Actual pyodide interpreters
├── examples.ts            # code samples
├── index.ts               # Will be emptied out.
├── protocol.ts            # types + enums of py protocol
├── pyodide.main.ts        # Main thread classes for py
├── pyodide.worker.lib.ts  # Actual code for worker
├── pyodide.worker.ts      # Worker itself.
└── README.md

0 directories, 8 files
```

# Terminology

Stuff is occurring at two venues:

- _Main._ Refers to stuff running on the main browser thread.
- _Worker._ A web worker running on another thread.

Messages are passed back and forth between these two threads and actions occur in response to the messages. Sometimes you might want to call stuff that occurs on the main thread as happening "client-side" but I think that obscures the fact that both threads make use of a "client" at various points. Follow [gRPC Terminology](https://grpc.io/docs/what-is-grpc/introduction/):

- _Service._ "Server-esque" object. Handles incoming messages and carries out required compute.
- _Client._ Sends a message with a `cmd` and well-defined payload to the other thread.

The main and worker threads both have service _and_ client classes.

# Plan

## Worker divisions

- _Top-level interpreter:_ Manage python environment and FS:
  - Functionality:
    - _Create_ child consoles.
    - [**Interrupts**](https://pyodide.org/en/stable/usage/keyboard-interrupts.html) Emscripten + python setup ~> it will happen at top level..
    - Surface FS info: what is in what dir? (Or just use `PyodideInterface#FS` directly?)
    - Misc. tasks (better to do in dedicated child console? Probably.)
      - Fetch banner/env info:
      - Handle output formatting (e.g. shorten large outputs.)
  - `PyodideInterface` also has some async eval possibilities worth exploring.
- _Child consoles:_ Run actual user code.
  - Actions:
    - Execute code statements.
    - Complete code.
  - captures:
    - For each command/call w/ ID:
      - Command received.
      - For each sub-command:
        - Start Run
        - SyntaxError: @code init ("pre-run")
        - stdout from `print` statements during run.
        - At end:
          - Final value as stdout-ish: differences in this being a PyProxy v. stdout being just a string.
          - stderr: Check for `PythonError`
