<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { TCodeExample } from '$lib/py/examples';
    import { tick } from 'svelte';

    type KeydownEventFull = KeyboardEvent & {
        currentTarget: EventTarget & HTMLTextAreaElement;
    };

    const dispatch = createEventDispatcher<{ run: { command: string } }>();

    export let command: string;
    export let codeExamples: TCodeExample[];
    export let isRunning: boolean;
    export let isLoaded: boolean;

    $: isReady = !isRunning && isLoaded;

    function handleRun() {
        dispatch('run', { command });
    }

    async function handleKeydown(e: KeydownEventFull) {
        for (const fn of [handleTabbing, handleSubmitShortcut]) {
            let out: boolean | Promise<boolean> = fn(e);
            if (out instanceof Promise) out = await out;
            if (out) return;
        }
    }
    async function handleTabbing(e: KeydownEventFull): Promise<boolean> {
        // Nasty way to handle tabs...
        if (e.code === 'Tab' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            e.preventDefault();

            const tgt = e.currentTarget;
            const se = tgt.selectionEnd,
                ss = tgt.selectionStart;

            const tab = '    ';
            command = command.slice(0, ss) + tab + command.slice(se);
            await tick();
            tgt.selectionEnd = tgt.selectionStart = se + tab.length;

            return true;
        }
        return false;
    }

    function handleSubmitShortcut(e: KeydownEventFull | KeyboardEvent): boolean {
        if (!isReady) {
            return false;
        }
        if (!(e.code === 'Enter' && e.ctrlKey)) {
            return false;
        }
        if (command.length === 0) {
            e.preventDefault();
            return false;
        }
        e.stopPropagation();
        handleRun(e);
        return true;
    }
</script>

<div class="box">
    <form action={null} class="form" on:submit|preventDefault={handleRun} disabled={!isReady}>
        <div class="columns">
            <div class="column">
                <div class="field">
                    <div class="control">
                        <button class="button" type="submit" disabled={!isReady}
                            >{!isReady ? 'Loading...' : 'Run code'}</button
                        >
                    </div>
                </div>
            </div>
            {#if codeExamples}
                <div class="column">
                    <div class="field">
                        <div class="control is-pulled-right">
                            <div class="select">
                                <select
                                    on:change={(e) => {
                                        const idx = e.currentTarget.selectedIndex;
                                        if (idx === 0) {
                                            return;
                                        }
                                        const ex = codeExamples[idx - 1];

                                        e.currentTarget.selectedIndex = 0;
                                        if (
                                            command.length > 0 &&
                                            !confirm('Clear current code to use the example?')
                                        ) {
                                            return;
                                        }
                                        command = ex.code;
                                    }}
                                >
                                    <option default disabled selected>Code examples</option>
                                    {#each codeExamples as ex}
                                        <option>{ex.name}</option>
                                    {/each}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>

        <div class="field">
            <div class="control">
                <textarea
                    class="textarea is-family-code"
                    bind:value={command}
                    placeholder={!isReady ? 'Loading...' : 'Write python code here...'}
                    on:keydown={handleKeydown}
                />
            </div>
            <p class="help">
                <kbd>Ctrl</kbd> + <kbd>Enter</kbd> executes the code.
            </p>
        </div>
    </form>
</div>
