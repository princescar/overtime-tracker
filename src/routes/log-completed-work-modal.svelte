<script lang="ts">
  import dayjs from "dayjs";
  import { Label } from "flowbite-svelte";
  import { t } from "#/stores/i18n.svelte";
  import { WorkLocation } from "#/types/worklog";
  import Modal from "#/components/modal.svelte";
  import Button from "#/components/button.svelte";
  import ToggleGroup from "#/components/toggle-group.svelte";
  import DateTimeInput from "#/components/date-time-input.svelte";
  import { worklogStore } from "#/stores/worklog.svelte";
  import { toastStore } from "#/stores/toast.svelte";

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
      await worklogStore.createCompleted({
        startTime: dayjs(startTime).startOf("minute").toDate(),
        endTime: dayjs(endTime).startOf("minute").toDate(),
        location,
        description: description || undefined,
      });
      open = false;
    } catch (error) {
      console.error(error);
      toastStore.error(error);
    } finally {
      isCreating = false;
    }
  };
</script>

<Modal title={t("log_completed_work")} bind:open>
  {#snippet footer()}
    <Button onclick={onCreate} loading={isCreating}>{t("log_work")}</Button>
  {/snippet}
  <div class="flex flex-col gap-4">
    <Label class="flex flex-col gap-1">
      <span>{t("start_time")}</span>
      <DateTimeInput bind:value={startTime} />
    </Label>
    <Label class="flex flex-col gap-1">
      <span>{t("end_time")}</span>
      <DateTimeInput bind:value={endTime} />
    </Label>
    <Label class="flex flex-col gap-1">
      <span>{t("location")}</span>
      <ToggleGroup
        bind:value={location}
        options={[
          { value: WorkLocation.HOME, label: t("home") },
          { value: WorkLocation.OFFICE, label: t("office") },
          { value: WorkLocation.BUSINESS_TRIP, label: t("business_trip") },
        ]}
      />
    </Label>
    <Label class="flex flex-col gap-1">
      <span>{t("description_optional")}</span>
      <textarea
        bind:value={description}
        class="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
        placeholder={t("description_placeholder")}
      ></textarea>
    </Label>
  </div>
</Modal>
