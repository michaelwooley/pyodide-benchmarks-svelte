# pyodide-benchmarks-svelte

....

# Developing

TODO Add "developing" section in README.

# Links


- [`ethanhs/python-wasm`](https://github.com/ethanhs/python-wasm) OG python demo. Still a lot of discussion there re:progress.
- Emscripten
  - Typescript
    - https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/emscripten/index.d.ts
    - https://github.com/imxood/emcc-typescript-example
- `ctypes`/`libffi` work:
  - https://gist.github.com/kleisauke/acfa1c09522705efa5eb0541d2d00887
  - https://github.com/pyodide/pyodide/pull/1656
  - https://github.com/emscripten-core/emscripten/issues/11066
- [`SharedArrayBuffer`: Security requirements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements) (mdn)
- Related repos by me ([`@michaelwooley`](https://github.com/michaelwooley)):
  - [pyodide webpack sample](https://github.com/michaelwooley/pyodide-webpack-example/tree/michael/fix-setup) Working version of [pyodide/pyodide-webpack-example](https://github.com/pyodide/pyodide-webpack-example). (See [PR #6](https://github.com/pyodide/pyodide-webpack-example/pull/6).)
  - [`michaelwooley/cpython-wasm-svelte-demo`](https://github.com/michaelwooley/cpython-wasm-svelte-demo) wasm-ized python from scratch (i.e. no pyodide).
  - [`michaelwooley/pybros`](https://github.com/michaelwooley/pybros) Collaborative python programming without a server aka, "Python in the browser with the bros."