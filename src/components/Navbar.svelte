<script lang="ts">
    import { PROJECT_EMOJI, PROJECT_NAME, PROJECT_REPO } from '$lib/constants';
    import * as routes from '$lib/routes';

    let toggleMenu = false;
</script>

<!-- NOTE Removed role="navigation" here for a11y -->
<nav class="navbar is-dark" aria-label="main navigation">
    <div class="navbar-brand">
        <a class="navbar-item has-text-weight-bold" href={routes.BASE}>
            {PROJECT_EMOJI}
            {PROJECT_NAME}
        </a>

        <!-- NOTE Converted to button -->
        <!-- <a role="button" -->
        <button
            class="navbar-burger"
            aria-label="menu"
            aria-expanded="false"
            data-target="navbarBasicExample"
            class:is-active={toggleMenu}
            on:click={() => {
                toggleMenu = !toggleMenu;
            }}
        >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
        </button>
        <!-- </a> -->
    </div>

    <div id="navbarBasicExample" class="navbar-menu" class:is-active={toggleMenu}>
        <div class="navbar-start">
            <a class="navbar-item" href={PROJECT_REPO} target="_blank"> GitHub </a>
        </div>
        <!--
        <div class="navbar-end">
            <a class="navbar-item" href={PROJECT_REPO} target="_blank"> GitHub </a>
        </div> -->
    </div>
</nav>
