<script lang="ts">
  import { t } from "#/stores/i18n.svelte";
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

<Modal {title} bind:open color="red">
  {#snippet footer()}
    <Button onclick={onConfirm}>{t("confirm")}</Button>
  {/snippet}
  <div class="mb-8">
    {message}
  </div>
</Modal>
