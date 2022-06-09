<script lang="ts">
    import { onMount } from 'svelte';

    onMount(async () => {
        console.log('Loading pyodide');
        const loadPyodide = await (await import('$lib/py')).loadPyodide;
        console.log(loadPyodide);
        await loadPyodide();
        // const mod = await import('$lib/rustPython/pkg/rustpython_wasm');
        // await mod.default();
        // pyExec = mod.pyExec;
        // pyExec('1+1'); // Warm up
    });
</script>

<div id="status">Status stuff...</div>

<style lang="scss">
</style>
