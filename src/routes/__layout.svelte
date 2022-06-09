<script lang="ts">
    import '../app.scss';
    import { PROJECT_NAME } from '$lib/constants';
</script>

<svelte:head>
    <title>{PROJECT_NAME}</title>
</svelte:head>

<main id="svelte">
    <slot />
</main>
