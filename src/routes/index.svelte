<script context="module">
    // TODO Remove this later
    export const prerender = false;
</script>

<script lang="ts">
    // import PyodideMainThreadDemo from '$containers/PyodideMainThreadDemo.svelte';
    import PyodideWorkerDemo from '$containers/PyodideWorkerDemo.svelte';
</script>

<section class="section">
    <div class="container">
        <!-- <PyodideMainThreadDemo /> -->
        <PyodideWorkerDemo />
    </div>
</section>
