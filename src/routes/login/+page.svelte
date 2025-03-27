<script lang="ts">
  import { onMount } from "svelte";
  import { t } from "#/stores/i18n.svelte";

  onMount(() => {
    const authUrl = new URL("/auth/login", window.location.origin);
    window.location.href = authUrl.toString();
  });
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
  <div class="w-full max-w-md space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {t("sign_in")}
      </h2>
    </div>
    <div class="mt-8 space-y-6">
      <div class="text-center">
        <p class="text-gray-600">
          {t("redirecting_to_sso")}
        </p>
      </div>
    </div>
  </div>
</div>
