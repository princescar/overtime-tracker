<script lang="ts">
  import dayjs from "dayjs";
  import { t } from "#/stores/messages.svelte";
  import { WorkLocation } from "#/types/worklog";
  import Modal from "#/components/modal.svelte";
  import Button from "#/components/button.svelte";
  import ToggleGroup from "#/components/toggle-group.svelte";
  import DateTimeInput from "#/components/date-time-input.svelte";
  import { createCompletedWork } from "#/stores/worklogs.svelte";
  import { toastError } from "#/stores/toasts.svelte";

  let { open = $bindable() } = $props();

  let startTime = $state(new Date()),
    endTime = $state(new Date()),
    location = $state(WorkLocation.HOME),
    description = $state("");
  let isCreating = $state(false);

  $effect(() => {
    if (open) {
      startTime = new Date();
      endTime = new Date();
      location = WorkLocation.HOME;
      description = "";
    }
  });

  const onCreate = async () => {
    isCreating = true;
    try {
      await createCompletedWork({
        startTime: dayjs(startTime).startOf("minute").toDate(),
        endTime: dayjs(endTime).startOf("minute").toDate(),
        location,
        description: description || undefined,
      });
      open = false;
    } catch (error) {
      console.error(error);
      toastError(error);
    } finally {
      isCreating = false;
    }
  };
</script>

<Modal bind:open>
  {#snippet heading()}{t("start_work")}{/snippet}
  <div class="flex flex-col gap-4">
    <div>
      <div class="text-sm font-medium">{t("start_time")}</div>
      <DateTimeInput id="startTime" bind:value={startTime} />
    </div>
    <div>
      <div class="text-sm font-medium">{t("end_time")}</div>
      <DateTimeInput id="startTime" bind:value={endTime} />
    </div>
    <div>
      <div class="text-sm font-medium">{t("location")}</div>
      <ToggleGroup
        bind:value={location}
        options={[
          { value: WorkLocation.HOME, label: t("home") },
          { value: WorkLocation.OFFICE, label: t("office") },
          { value: WorkLocation.BUSINESS_TRIP, label: t("business_trip") },
        ]}
      />
    </div>
    <div>
      <div class="text-sm font-medium">{t("description_optional")}</div>
      <textarea
        id="description"
        bind:value={description}
        class="w-full rounded-lg border border-slate-300 p-2"
        placeholder={t("description_placeholder")}
      ></textarea>
    </div>
    <div class="flex justify-end gap-4">
      <Button onclick={onCreate} loading={isCreating}>{t("log_work")}</Button>
    </div>
  </div>
</Modal>
