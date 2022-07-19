<script lang="ts">
    import nanoid from 'nanoid';
    import { SimpleRepl } from '$components/SimpleRepl';
    import { PYODIDE_INDEX_URL } from '$lib/constants';
    import { codeExamples } from '$lib/py/examples';
    import type { PyConsole, PyMain } from '$lib/py/runtime';
    import type { IPyconsoleCallbacks } from '$lib/py/runtime.types';

    import { onMount } from 'svelte';

    let command: string = codeExamples[0].code;
    let output: string[] = [];
    let py: PyMain;
    let csl: PyConsole;

    $: isLoaded = py && csl && csl.status !== 'starting';
    $: isRunning = csl && csl.status === 'active';

    onMount(async () => {
        const PyMain = await (await import('$lib/py/runtime')).PyMain;

        py = await PyMain.init(PYODIDE_INDEX_URL, {
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
        } as IPyconsoleCallbacks);

        csl = py.createConsole('0', 'cons');
    });

    async function handleSubmit() {
        if (!isLoaded || isRunning) {
            console.warn('Cannot run right now: ');
            return;
        }

        await csl.run(command, nanoid.nanoid());
    }
</script>

<SimpleRepl {output} bind:command {isRunning} {isLoaded} {codeExamples} on:submit={handleSubmit}>
    <span slot="title">
        Library: <code>PyMain</code> + <code>PyConsole</code> on main thread.
    </span>
</SimpleRepl>
