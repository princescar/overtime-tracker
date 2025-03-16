<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade } from "svelte/transition";
  import { Toast } from "flowbite-svelte";
  import { CheckCircleSolid, CloseCircleSolid } from "flowbite-svelte-icons";
  import { t, i18nStore } from "#/stores/i18n.svelte";
  import { toastStore } from "#/stores/toast.svelte";
  import Button from "#/components/button.svelte";
  import { request } from "#/utils/request";
  import "../app.css";

  const { children }: { children: Snippet } = $props();

  let isSwitchingLanguage = $state(false);

  const onSwitchLanguage = async () => {
    isSwitchingLanguage = true;
    try {
      const newLanguage = i18nStore.language === "en" ? "zh" : "en";
      void request("/api/preferences/language", "PUT", { language: newLanguage });
      await i18nStore.load(newLanguage);
    } finally {
      isSwitchingLanguage = false;
    }
  };
</script>

<svelte:head>
  <title>{t("overtime_tracker")}</title>
  <meta name="description" content={t("overtime_tracker_description")} />
</svelte:head>

{@render switchLanguageButton()}
{@render children()}
{@render toastContainer()}

{#snippet switchLanguageButton()}
  <div class="flex justify-end p-2">
    <Button variant="subtle" onclick={onSwitchLanguage} loading={isSwitchingLanguage}>
      {t("language")}
    </Button>
  </div>
{/snippet}

{#snippet toastContainer()}
  <div class="fixed right-4 bottom-4 z-50 flex flex-col gap-4 gap-4">
    {#each toastStore.toasts as [id, { message, type }] (id)}
      <div transition:fade={{ duration: 150 }}>
        <Toast class="rounded-sm" color={type === "error" ? "red" : undefined}>
          <svelte:fragment slot="icon">
            {#if type === "error"}
              <CloseCircleSolid class="h-5 w-5" />
            {:else if type === "success"}
              <CheckCircleSolid class="h-5 w-5" />
            {/if}
          </svelte:fragment>
          {message}
        </Toast>
      </div>
    {/each}
  </div>
{/snippet}
