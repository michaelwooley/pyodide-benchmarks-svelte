/**
 * Reference constants
 */

export const PROJECT_NAME = 'pyodide benchmarks';
export const PROJECT_AUTHOR = 'Michael Wooley';
export const PROJECT_EMOJI = '🐍';
export const PROJECT_REPO = 'https://github.com/michaelwooley/pyodide-benchmarks-svelte';
export const PROJECT_LICENSE = 'GNU General Public License v3.0';
export const PROJECT_LICENSE_URL = `${PROJECT_REPO}/blob/dev/LICENSE`;

export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${
    import.meta.env.VITE_PYODIDE_VERSION || 'v0.20.1a1'
}/full/`;
