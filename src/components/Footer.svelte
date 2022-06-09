<script lang="ts">
    import { PROJECT_AUTHOR, PROJECT_EMOJI, PROJECT_NAME, PROJECT_REPO } from '$lib/constants';
    import * as routes from '$lib/routes';
</script>

<footer class="footer">
    <div class="container">
        <div class="content">
            <p>
                <a href={routes.BASE}> {PROJECT_EMOJI} <strong>{PROJECT_NAME}</strong> </a> | By
                {PROJECT_AUTHOR} |
                <a href={PROJECT_REPO} target="_blank">GitHub</a>
            </p>
        </div>
    </div>
</footer>

<style lang="scss">
    footer.footer {
        min-height: 150px;
    }
</style>
