<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade } from "svelte/transition";
  import { createDialog, melt } from "@melt-ui/svelte";

  interface ModalProps {
    open?: boolean;
    heading?: Snippet;
    children: Snippet;
  }

  let { open = $bindable(), heading, children }: ModalProps = $props();

  const {
    elements: { overlay, content, title, close, portalled },
    states: { open: stateOpen },
  } = createDialog({
    defaultOpen: open,
  });

  // Sync states
  $effect(() => {
    $stateOpen = open ?? false;
  });
  $effect(() => {
    open = $stateOpen;
  });
  const duration = 150;
</script>

{#if $stateOpen}
  <div use:melt={$portalled}>
    <div
      use:melt={$overlay}
      in:fade={{ duration }}
      out:fade={{ duration }}
      class="fixed inset-0 bg-black/50 dark:bg-gray-900/75"
    ></div>
    <div
      use:melt={$content}
      in:fade={{ duration }}
      out:fade={{ duration }}
      class="fixed left-[50%] top-[50%] w-full max-w-sm translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800"
    >
      {#if heading}
        <div use:melt={$title} class="mb-4 text-lg font-medium">{@render heading()}</div>
      {/if}
      {@render children()}
      {@render closeButton()}
    </div>
  </div>
{/if}

{#snippet closeButton()}
  <button
    use:melt={$close}
    aria-label="close"
    class="absolute right-3.5 top-3.5 cursor-pointer rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
  >
    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </button>
{/snippet}
