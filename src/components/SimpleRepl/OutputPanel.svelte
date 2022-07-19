<script lang="ts">
    export let output: string[] = [];
</script>

<hr />
<div class="box">
    {#if output && output.length > 0}
        {#each output as cb}
            <pre class="p-2">{cb}</pre>
        {/each}
    {:else}
        <article class="message is-info">
            <div class="message-body">Console output will go here.</div>
        </article>
    {/if}
</div>
