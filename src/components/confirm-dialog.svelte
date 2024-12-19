<script lang="ts">
  import { t } from "#/stores/messages.svelte";
  import Button from "./button.svelte";
  import Modal from "./modal.svelte";

  let open = $state(false);
  let message = $state("");
  let title = $state("");
  let resolve = $state<(value: PromiseLike<void> | void) => void>();
  let reject = $state<(reason?: unknown) => void>();

  export const promptConfirm = (msg: string, tt: string) => {
    message = msg;
    title = tt;
    open = true;
    return new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
  };

  const onConfirm = () => {
    resolve?.();
    resolve = undefined;
    reject = undefined;
    open = false;
  };

  $effect(() => {
    if (!open) {
      reject?.();
      resolve = undefined;
      reject = undefined;
    }
  });
</script>

<Modal bind:open>
  {#snippet heading()}{title}{/snippet}
  {message}
  <div class="mt-8 flex justify-end gap-4">
    <Button onclick={onConfirm}>{t("confirm")}</Button>
  </div>
</Modal>
