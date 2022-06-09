import { resolve } from 'path';
import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: [
        preprocess({
            scss: {
                prependData: '@use "src/variables.scss" as *;'
            }
        })
    ],

    kit: {
        adapter: adapter(),

        vite: {
            resolve: {
                alias: {
                    $components: resolve('./src/components'),
                    $containers: resolve('./src/containers')
                }
            },

            css: {
                preprocessorOptions: {
                    scss: {
                        additionalData: '@use "src/variables.scss" as *;'
                    }
                }
            },

            server: {
                fs: {
                    allow: ['.pyodide']
                }
            }
        }
    }
};

export default config;
