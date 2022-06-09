<script lang="ts">
    import { onMount } from 'svelte';

    let out: string, meas: PerformanceEntry;

    onMount(async () => {
        const loadPyodide = await (await import('$lib/py')).loadPyodide;
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
        {/if}
    </ul>
</div>

{#if out}
    <hr />
    <div>
        <pre>{out}</pre>
    </div>
{/if}

<style lang="scss">
</style>
