<script lang="ts">
    import { transcript } from "$lib/stores/transcript";
    import { fade, fly } from "svelte/transition";

    // Props
    let { show = true } = $props<{ show?: boolean }>();

    let containerRef: HTMLDivElement | null = $state(null);

    // Auto-scroll to bottom
    function scrollToBottom() {
        if (containerRef) {
            containerRef.scrollTop = containerRef.scrollHeight;
        }
    }

    $effect(() => {
        if ($transcript) {
            scrollToBottom();
        }
    });

    // Derived state: only show last 1 entry
    let visibleEntries = $derived($transcript.slice(-1));
</script>

{#if show && visibleEntries.length > 0}
    <div
        class="pointer-events-none fixed bottom-32 left-1/2 z-30 w-full max-w-2xl -translate-x-1/2 px-4"
        in:fade={{ duration: 300 }}
        out:fade={{ duration: 300 }}
    >
        <div
            bind:this={containerRef}
            class="flex flex-col gap-3 overflow-hidden"
        >
            {#each visibleEntries as entry, i (i)}
                <div
                    class="flex w-full {entry.speaker === 'user'
                        ? 'justify-end'
                        : 'justify-start'}"
                    in:fly={{ y: 20, duration: 400 }}
                >
                    <div
                        class="max-w-[85%] rounded-2xl px-5 py-2.5 shadow-sm backdrop-blur-md transition-all
						{entry.speaker === 'user'
                            ? 'bg-mblue rounded-tr-sm border border-indigo-400/10'
                            : 'bg-slate-800/60 text-slate-100/90 rounded-tl-sm border border-white/5'}"
                    >
                        <p
                            class="text-lg leading-relaxed font-medium drop-shadow-sm"
                        >
                            {entry.text}
                        </p>
                    </div>
                </div>
            {/each}
        </div>

        <!-- Gradient fade mask at top -->
        <div
            class="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent to-transparent"
        ></div>
    </div>
{/if}

<style>
    /* Smooth scrolling behaviour if we needed it, but we are just snapping mostly */
    /* Hide scrollbar */
    div::-webkit-scrollbar {
        display: none;
    }
</style>
