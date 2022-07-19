<script lang="ts">
    import type { TCodeExample } from '$lib/py/examples';
    import InputPanel from './InputPanel.svelte';
    import OutputPanel from './OutputPanel.svelte';

    export let command: string;
    export let output: string[] = [];
    export let codeExamples: TCodeExample[] = [];
    export let isRunning: boolean;
    export let isLoaded: boolean;
</script>

<div class="content">
    <h1 class="title is-1">
        <slot name="title">
            <span> Simple repl </span>
        </slot>
    </h1>

    <!-- <ul>
        <li><strong>Status </strong>: {py ? '✅ Ready.' : '⏳ Loading...'}</li>
        <li>⚠️ The browser will probably feel like it is "freezing" until the load is complete.</li>
    </ul> -->
    <slot name="info">
        <span />
    </slot>
</div>

<slot name="input">
    <InputPanel bind:command {codeExamples} {isRunning} {isLoaded} on:run />
</slot>

<hr />
<slot name="output">
    <OutputPanel {output} />
</slot>
