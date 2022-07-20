# pyodide-benchmarks-svelte

....

# Developing

TODO Add "developing" section in README.

## Gotchas

-   Must use chromium-based browser (non-firefox) in dev mode!

## Reference environment

```bash
❯ npx envinfo --system --npmPackages '{pyodide,pyodide/*,vite,@sveltejs/kit,svelte}' --binaries --browsers

  System:
    OS: Linux 5.10 Manjaro Linux
    CPU: (8) x64 11th Gen Intel(R) Core(TM) i7-1165G7 @ 2.80GHz
    Memory: 6.04 GB / 15.34 GB
    Container: Yes
    Shell: 5.9 - /usr/bin/zsh
  Binaries:
    Node: 16.13.0 - ~/.nvm/versions/node/v16.13.0/bin/node
    Yarn: 1.22.15 - ~/.nvm/versions/node/v16.13.0/bin/yarn
    npm: 8.6.0 - ~/.nvm/versions/node/v16.13.0/bin/npm
  Browsers:
    Brave Browser: 101.1.38.119
    Chromium: 101.0.4951.64
    Firefox: 100.0
  npmPackages:
    @sveltejs/kit: next => 1.0.0-next.350
    pyodide: file:.pyodide/pyodide => 0.20.1-alpha.1
    svelte: ^3.44.0 => 3.48.0
```

# Links

-   [`ethanhs/python-wasm`](https://github.com/ethanhs/python-wasm) OG python demo. Still a lot of discussion there re:progress.
-   Emscripten
    -   Typescript
        -   https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/emscripten/index.d.ts
        -   https://github.com/imxood/emcc-typescript-example
-   `ctypes`/`libffi` work:
    -   https://gist.github.com/kleisauke/acfa1c09522705efa5eb0541d2d00887
    -   https://github.com/pyodide/pyodide/pull/1656
    -   https://github.com/emscripten-core/emscripten/issues/11066
-   [`SharedArrayBuffer`: Security requirements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements) (mdn)
-   Related repos by me ([`@michaelwooley`](https://github.com/michaelwooley)):
    -   [pyodide webpack sample](https://github.com/michaelwooley/pyodide-webpack-example/tree/michael/fix-setup) Working version of [pyodide/pyodide-webpack-example](https://github.com/pyodide/pyodide-webpack-example). (See [PR #6](https://github.com/pyodide/pyodide-webpack-example/pull/6).)
    -   [`michaelwooley/cpython-wasm-svelte-demo`](https://github.com/michaelwooley/cpython-wasm-svelte-demo) wasm-ized python from scratch (i.e. no pyodide).
    -   [`michaelwooley/pybros`](https://github.com/michaelwooley/pybros) Collaborative python programming without a server aka, "Python in the browser with the bros."
