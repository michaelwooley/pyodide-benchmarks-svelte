/**
 * Reference constants
 */

export const PROJECT_NAME = 'pyodide benchmarks';
export const PROJECT_EMOJI = '🥧';
export const PROJECT_REPO = 'https://github.com/michaelwooley/pyodide-benchmarks-svelte';

export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${
    import.meta.env.VITE_PYODIDE_VERSION || 'v0.20.1a1'
}/full/`;
