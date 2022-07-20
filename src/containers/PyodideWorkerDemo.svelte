<script lang="ts">
    import { onMount } from 'svelte';
    import CheckChromeForDev from '$components/CheckChromeForDev.svelte';
    import { createPyWorker } from '$lib/py/worker.creator';
    import type { GetInsidePromise } from 'src/app';

    let isReady = false;
    let value = '';
    let worker: GetInsidePromise<ReturnType<typeof createPyWorker>>['worker'];
    let client: GetInsidePromise<ReturnType<typeof createPyWorker>>['client'];

    onMount(async () => {
        const ipw = await createPyWorker();
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
    <h1 class="title is-1">Pyodide on web worker (Take ... n?)</h1>

    <ul>
        <li><strong>Status </strong>: {isReady ? '✅ Ready.' : '⏳ Loading...'}</li>
        {#if isReady}
            <!-- <li><strong>{meas.name} </strong>: {(meas.duration / 1000).toPrecision(3)}s.</li> -->
            <li>[Measure]</li>
        {:else}
            <li>Yeah wait a bit.</li>
        {/if}
    </ul>
</div>

<div class="field">
    <div class="control">
        <textarea
            class="textarea is-family-code"
            bind:value
            on:blur={() => client(value)}
            placeholder={!isReady ? 'Loading...' : 'Write python code here...'}
        />
    </div>
    <p class="help">Blur to run the code.</p>
</div>
<button class="button is-large" on:click={() => client(value)}>Run code</button>
