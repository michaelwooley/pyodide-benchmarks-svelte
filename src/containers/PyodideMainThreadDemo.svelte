<script lang="ts">
    import { nanoid } from 'nanoid';
    import SimpleRepl from '$components/SimpleRepl/SimpleRepl.svelte';
    import { PYODIDE_INDEX_URL } from '$lib/constants';
    import { codeExamples } from '$lib/py/examples';
    import type { PyConsole, PyMain } from '$lib/py/runtime';
    import type { IPyconsoleCallbacks } from '$lib/py/runtime.types';

    import { onMount, tick } from 'svelte';

    // TOOD Move these to a dedicated place...
    const consoleCallbacks = {
        onOutput: (payload) => {
            console.log('output', payload);
            let data = payload.msg.split('\n');
            let l = [`[OUTPUT:${payload.stream}] ${data.length > 0 ? data[0] : ''}`];
            if (data.length > 1) {
                l = l.concat(data.slice(1));
            }
            output = output.concat(l);
        },
        onStartCmd: (payload) => {
            console.log('start', payload);
            let data = payload.code.split('\n');
            let l = [`[START] ${data.length > 0 ? data[0] : ''}`];
            if (data.length > 1) {
                l = l.concat(data.slice(1).map((l) => `...${l}`));
            }
            output = output.concat(l);
        },
        onEndCmd: (payload) => {
            console.log('end', payload);
            const data = (
                'result' in payload
                    ? payload.result
                    : `${payload.err.kind} ${payload.err.msg}\n${payload.err.traceback}`
            ).split('\n');
            let l = [`[END][${payload.status}] ${data.length > 0 ? data[0] : ''}`];
            if (data.length > 1) {
                l = l.concat(data.slice(1));
            }
            output = output.concat(l);
        }
    } as IPyconsoleCallbacks;

    let command: string = codeExamples[0].code;
    let output: string[] = [];
    let py: PyMain | undefined;
    let csl: PyConsole;

    $: isLoaded = py != null && csl != null && csl.status !== 'starting' ? true : false;
    $: isRunning = csl != null && csl.status === 'active' ? true : false;

    onMount(async () => {
        const PyMain = await (await import('$lib/py/runtime')).PyMain;
        py = await PyMain.init(PYODIDE_INDEX_URL, consoleCallbacks);
        csl = py.createConsole('0', 'console');

        await tick(); // ensures that isLoaded, isRunning kick in.

        return () => {
            // TODO Shut this down...
            py = undefined;
        };
    });

    async function handleRunCommand() {
        if (!isLoaded) {
            console.warn('Cannot run right now: ');
            return;
        }

        await csl.run(command, nanoid());
    }
</script>

<SimpleRepl {output} bind:command {isRunning} {isLoaded} {codeExamples} on:run={handleRunCommand}>
    <span slot="title">
        Library: <code>PyMain</code> + <code>PyConsole</code> on main thread.
    </span>

    <ul slot="info">
        <li><strong>Status </strong>: {isLoaded ? '✅ Ready.' : '⏳ Loading...'}</li>
        <li>⚠️ The browser will probably feel like it is "freezing" until the load is complete.</li>
        <li>
            📋 TODOs:
            <details>
                <summary class="is-selectable">
                    View full list
                    <span class="icon">👇</span>
                </summary>

                <ol>
                    <li>Get the pyodide static in order</li>
                    <li>Handle multi-line statements</li>
                    <li>Add webworker initializer.</li>
                    <li>Add service worker for pyodide assets.</li>
                    <li>Add py console session exports.</li>
                </ol>
            </details>
        </li>
    </ul>
</SimpleRepl>
