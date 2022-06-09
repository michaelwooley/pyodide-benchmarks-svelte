<script lang="ts">
    import type { PyodideInterface } from '$lib/py';
    import { codeExamples } from '$lib/py/examples';
    import { tick } from 'svelte';

    import { onMount } from 'svelte';

    let banner: string,
        pyodide: PyodideInterface,
        interp: (s: string) => Promise<void>,
        meas: PerformanceEntry;

    let output: { s: string; kind: 'cmd' | 'stdout' | 'stderr' }[] = [];
    let command = '';
    let isRunning = false;

    const handleStdout = (s: string, kind: 'cmd' | 'stdout' | 'stderr'): void => {
        // TODO Handle stdout better: differs between final return and regular printed stuff.
        // console.log(kind, s, typeof s, `string: "${s}" | "${s.trim()}"`);
        // let currentOutput = "";
        // if (kind === "stdout") {
        //     const currentOutput = output.pop();
        //     currentOutput.s += s;
        // }

        output = output.concat([{ s, kind }]);
    };

    const handleRepl = async () => {
        if (!interp) {
            alert('Must wait until the interpreter is ready to go.');
            return;
        }
        if (command.length === 0) {
            alert('Must enter some command!');
            return;
        }
        isRunning = true;
        const c = command.trimEnd();
        command = '';
        try {
            await interp(c);
        } finally {
            isRunning = false;
        }
    };

    onMount(async () => {
        const pkg = await import('$lib/py');
        const interpreterFactory = pkg.interpreterFactory;
        const loadPyodide = pkg.loadPyodide;
        const markStart = 'markStart',
            markEnd = 'markEnd';
        performance.mark(markStart);
        const out = await loadPyodide().then((b) => {
            performance.mark(markEnd);
            return b;
        });
        performance.measure('loadPyodide', markStart, markEnd);
        meas = performance.getEntriesByName('loadPyodide', 'measure')[0];
        banner = out.banner;
        pyodide = out.pyodide;
        interp = interpreterFactory({
            pyodide,
            callback: handleStdout
        });
        handleStdout(banner, 'stdout');
        console.log(banner, meas);
    });
</script>

<div class="content">
    <h1 class="title is-1">
        Pyodide on main thread (See issue <a
            href="https://github.com/michaelwooley/pyodide-benchmarks-svelte/issues/4"
            target="_blank">#4</a
        >)
    </h1>

    <ul>
        <li><strong>Status </strong>: {meas ? '✅ Ready.' : '⏳ Loading...'}</li>
        {#if meas}
            <li><strong>{meas.name} </strong>: {(meas.duration / 1000).toPrecision(3)}s.</li>
        {:else}
            <li>
                ⚠️ The browser will probably feel like it is "freezing" until the load is complete.
            </li>
        {/if}
    </ul>
</div>

<div class="box">
    <form class="form" on:submit|preventDefault={handleRepl} disabled={isRunning}>
        <div class="columns">
            <div class="column">
                <div class="field">
                    <div class="control">
                        <button class="button" type="submit" disabled={!interp}
                            >{!interp ? 'Loading...' : 'Run code'}</button
                        >
                    </div>
                </div>
            </div>
            <div class="column">
                <div class="field">
                    <div class="control is-pulled-right">
                        <div class="select">
                            <select
                                on:change={(e) => {
                                    const idx = e.currentTarget.selectedIndex;
                                    if (idx === 0) {
                                        return;
                                    }
                                    const ex = codeExamples[idx - 1];

                                    e.currentTarget.selectedIndex = 0;
                                    if (
                                        command.length > 0 &&
                                        !confirm('Clear current code to use the example?')
                                    ) {
                                        return;
                                    }
                                    command = ex.code;
                                }}
                            >
                                <option default disabled selected>Code examples</option>
                                {#each codeExamples as ex}
                                    <option>{ex.name}</option>
                                {/each}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="field">
            <div class="control">
                <textarea
                    class="textarea is-family-code"
                    bind:value={command}
                    placeholder={!interp ? 'Loading...' : 'Write python code here...'}
                    on:keydown={async (e) => {
                        // Nasty way to handle tabs...
                        if (e.code === 'Tab' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                            e.preventDefault();

                            const tgt = e.currentTarget;
                            const se = tgt.selectionEnd,
                                ss = tgt.selectionStart;

                            const tab = '    ';
                            command = command.slice(0, ss) + tab + command.slice(se);
                            await tick();
                            tgt.selectionEnd = tgt.selectionStart = se + tab.length;

                            return;
                        }
                        if (!(e.code === 'Enter' && e.ctrlKey)) {
                            return;
                        }
                        if (command.length === 0) {
                            e.preventDefault();
                            return;
                        }
                        handleRepl();
                    }}
                />
            </div>
            <p class="help">
                <kbd>Ctrl</kbd> + <kbd>Enter</kbd> executes the code.
            </p>
        </div>
    </form>
</div>

{#if output.length > 0}
    <hr />
    <div class="box">
        {#each output as cb}
            <pre
                class="p-2"
                class:has-background-danger-light={cb.kind === 'stderr'}
                class:has-background-info-light={cb.kind === 'cmd'}>{cb.s}</pre>
        {/each}
    </div>
{/if}

<style lang="scss">
    .column,
    .columns {
        margin-bottom: 0;
    }
</style>
