<script lang="ts">
  import { createToaster, melt } from "@melt-ui/svelte";
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";
  import { toastStore } from "#/stores/toast.svelte";

  interface ToastData {
    message: string;
    title?: string;
  }

  const {
    elements: { content, title, description, close },
    helpers: { addToast },
    states: { toasts },
    actions: { portal },
  } = createToaster<ToastData>();

  toastStore.init((message: string, title?: string) => addToast({ data: { message, title } }));
</script>

<div
  use:portal
  class="fixed right-0 top-0 z-50 m-4 flex flex-col items-end gap-2 md:bottom-0 md:top-auto"
>
  {#each $toasts as { id, data } (id)}
    <div
      use:melt={$content(id)}
      animate:flip={{ duration: 500 }}
      in:fly={{ duration: 150, x: "100%" }}
      out:fly={{ duration: 150, x: "100%" }}
      class="rounded-lg bg-neutral-100 shadow-md dark:bg-gray-800"
    >
      <div
        class="relative flex w-[24rem] max-w-[calc(100vw-2rem)] items-center justify-between gap-4 p-5"
      >
        <div>
          <h3 use:melt={$title(id)} class="flex items-center gap-2 font-semibold">
            {data.title}
            <span class="size-1.5 rounded-full"></span>
          </h3>
          <div use:melt={$description(id)}>
            {data.message}
          </div>
        </div>
        <button
          use:melt={$close(id)}
          class="text-magnum-500 hover:bg-magnum-900/50 absolute right-4 top-4 grid size-6 place-items-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-labelledby="close"
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
      </div>
    </div>
  {/each}
</div>
