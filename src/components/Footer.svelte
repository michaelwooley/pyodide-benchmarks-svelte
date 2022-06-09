<script lang="ts">
    import {
        PROJECT_AUTHOR,
        PROJECT_EMOJI,
        PROJECT_LICENSE,
        PROJECT_LICENSE_URL,
        PROJECT_NAME
    } from '$lib/constants';
    import * as routes from '$lib/routes';
</script>

<footer class="footer">
    <div class="container">
        <div class="content has-text-centered">
            <p>
                <a href={routes.BASE}> {PROJECT_EMOJI} <strong>{PROJECT_NAME}</strong> </a> by
                {PROJECT_AUTHOR}. Licensed under the
                <a href={PROJECT_LICENSE_URL} target="_blank"> {PROJECT_LICENSE}</a>.
                <!-- <br />
                <a href={PROJECT_REPO} target="_blank">🐙 GitHub</a> -->
            </p>
        </div>
    </div>
</footer>

<style lang="scss">
    footer.footer {
        min-height: 150px;
    }
</style>
