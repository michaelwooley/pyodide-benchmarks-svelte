<script lang="ts">
    import { onMount } from 'svelte';
    import PyWorker from '$lib/py/pyodide.worker.js?worker';
    import { getBrowserName } from '$lib/util';
    import { dev } from '$app/env';
    let isReady = false,
        worker: Worker;

    onMount(async () => {
        if (dev && getBrowserName() !== 'Chrome') {
            alert(
                'Chrome is required in dev mode! Handling of imports in web workers is the issue!'
            );
            return;
        }

        worker = new PyWorker();
        worker.onmessage = (e) => {
            console.log('Worker msg:', e.data);
        };
        isReady = true;
    });
</script>

<div class="content">
    <h1 class="title is-1">
        Pyodide on web worker (See issue <a
            href="https://github.com/michaelwooley/pyodide-benchmarks-svelte/issues/5"
            target="_blank">#5</a
        >)
    </h1>

    <ul>
        <li><strong>Status </strong>: {isReady ? '✅ Ready.' : '⏳ Loading...'}</li>
        {#if isReady}
            <!-- <li><strong>{meas.name} </strong>: {(meas.duration / 1000).toPrecision(3)}s.</li> -->
            <li>[Measure]</li>
        {:else}
            <li>
                ⚠️ The browser will probably feel like it is "freezing" until the load is complete.
            </li>
        {/if}
    </ul>
</div>
