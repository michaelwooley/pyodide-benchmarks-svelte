<script lang="ts">
    import { onMount } from 'svelte';
    import CheckChromeForDev from '$components/CheckChromeForDev.svelte';
    import { initPyWorker } from '$lib/py/worker.handler';
    import type { GetInsidePromise } from 'src/app';

    let isReady = false;
    let value = '';
    let worker: GetInsidePromise<ReturnType<typeof initPyWorker>>['worker'];
    let client: GetInsidePromise<ReturnType<typeof initPyWorker>>['client'];

    onMount(async () => {
        const ipw = await initPyWorker();
        worker = ipw.worker;
        client = ipw.client;

        isReady = true;
        console.log(worker, client);
        client('hellow, worl');

        // Unload handler
        return () => {
            worker.terminate();
        };
    });
</script>

<CheckChromeForDev />

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
                {`worker: ${worker}`}
            </li>
        {/if}
    </ul>
</div>

<textarea bind:value on:blur={() => client(value)} />
