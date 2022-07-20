<!-- Dev utility: Firefox will not work in dev mode if using vite [or pyodide?] w/ web workers/imports/etc. -->
<script lang="ts">
    import { onMount } from 'svelte';

    import { getBrowserName } from '$lib/util';
    import { dev } from '$app/env';

    let incompatibleBrowser = !dev;

    onMount(async () => {
        incompatibleBrowser = dev && getBrowserName() !== 'Chrome';
        if (incompatibleBrowser) {
            alert(
                'Chrome is required in dev mode! Handling of imports in web workers is the issue!'
            );
            return;
        }
    });
</script>

{#if incompatibleBrowser}
    <div class="notification is-warning">
        Non-chrome browsers aren't workeing in non-chrome in dev!!!
    </div>
{/if}
