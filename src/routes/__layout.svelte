<script lang="ts">
    import '../app.scss';
    import { PROJECT_NAME } from '$lib/constants';
    import Footer from '$components/Footer.svelte';
    import Navbar from '$components/Navbar.svelte';
</script>

<svelte:head>
    <title>{PROJECT_NAME}</title>
</svelte:head>

<Navbar />

<main id="svelte">
    <slot />
</main>

<Footer />

<style lang="scss">
    body {
        min-height: 100vh;
    }
    main {
        min-height: calc(100vh - 150px);
    }
</style>
