# pyodide adapters

Initial work based off of what was happening in [`michaelwooley/pybros/michael/add-pyodide`](https://github.com/michaelwooley/pybros/tree/0a97fa9448c8c0738e631e16664c4ed9f8e608c6/src/lib/pyodide).

```bash
❯ cd src/lib/py
❯ tree

# ...
# TODO Add this
```


# Terminology

Stuff is occurring at two venues:

- _Main._ Refers to stuff running on the main browser thread.
- _Worker._ A web worker running on another thread.

Messages are passed back and forth between these two threads and actions occur in response to the messages. Sometimes you might want to call stuff that occurs on the main thread as happening "client-side" but I think that obscures the fact that both threads make use of a "client" at various points. Follow [gRPC Terminology](https://grpc.io/docs/what-is-grpc/introduction/):

- _Service._ "Server-esque"  object. Handles incoming messages and carries out required compute.
- _Client._ Sends a message with a `cmd` and well-defined payload to the other thread.

The main and worker threads both have service _and_ client classes.