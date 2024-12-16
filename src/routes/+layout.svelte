<script lang="ts">
  import type { Snippet } from "svelte";
  import { language, t, changeLanguage } from "#/stores/messages.svelte";
  import Button from "#/components/button.svelte";
  import Toasts from "#/components/toasts.svelte";
  import { request } from "#/utils/request";
  import "../app.css";

  const { children }: { children: Snippet } = $props();

  let isSwitchingLanguage = $state(false);

  const onSwitchLanguage = async () => {
    isSwitchingLanguage = true;
    try {
      const newLanguage = language() === "en" ? "zh" : "en";
      void request("/api/preferences/language", "PUT", { language: newLanguage });
      await changeLanguage(newLanguage);
    } finally {
      isSwitchingLanguage = false;
    }
  };
</script>

<svelte:head>
  <title>{t("overtime_tracker")}</title>
</svelte:head>

{#snippet switchLanguageButton()}
  <Button variant="subtle" onclick={onSwitchLanguage} loading={isSwitchingLanguage}>
    {t("language")}
  </Button>
{/snippet}

<div class="flex justify-end p-2">
  {@render switchLanguageButton()}
</div>
{@render children()}
<Toasts />