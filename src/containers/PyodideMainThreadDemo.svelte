<script lang="ts">
    import { onMount } from 'svelte';

    let out: string, meas: PerformanceEntry;

    onMount(async () => {
        console.log('Loading pyodide');
        const loadPyodide = await (await import('$lib/py')).loadPyodide;
        console.log(loadPyodide);
        const markStart = 'markStart',
            markEnd = 'markEnd';
        performance.mark(markStart);
        out = await loadPyodide().then((b) => {
            performance.mark(markEnd);
            return b;
        });
        performance.measure('loadPyodide', markStart, markEnd);
        meas = performance.getEntriesByName('loadPyodide', 'measure')[0];

        console.log(out, meas);
    });
</script>

<h1 class="title is-1">
    Pyodide on main thread (See issue <a
        href="https://github.com/michaelwooley/pyodide-benchmarks-svelte/issues/4"
        target="_blank">#4</a
    >)
</h1>
<div id="status">Status stuff...</div>
{#if out}
    <div>
        <pre>{out}</pre>
    </div>
{/if}
{#if meas}
    <ul>
        <li>{meas.name} : {(meas.duration / 1000).toPrecision(3)}s.</li>
    </ul>
{/if}

<style lang="scss">
</style>
