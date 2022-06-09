/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
    // interface Locals {}
    // interface Platform {}
    // interface Session {}
    // interface Stuff {}
}

// Brilliant: https://stackoverflow.com/a/60301306/3422060
type GetInsidePromise<X> = X extends Promise<infer I> ? I : never;
