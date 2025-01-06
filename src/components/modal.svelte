<script lang="ts">
  import { Modal } from "flowbite-svelte";
  import type { ModalProps as FlowbiteModalProps } from "flowbite-svelte/Modal.svelte";
  import { fade } from "svelte/transition";
  import type { Snippet } from "svelte";

  interface ModalProps {
    open?: boolean;
    children: Snippet;
    footer?: Snippet;
  }

  let {
    open = $bindable(),
    children,
    footer: _footer,
    ...props
  }: ModalProps & FlowbiteModalProps = $props();
</script>

{#if open}
  <div transition:fade={{ duration: 150 }}>
    <Modal bind:open size="xs" classHeader="py-3 md:py-3 text-gray-900" {...props}>
      {@render children()}
      {@render (_footer ? footer : undefined)?.()}
    </Modal>
  </div>
{/if}

{#snippet footer()}
  <div class="flex justify-end gap-4">
    {@render _footer?.()}
  </div>
{/snippet}
