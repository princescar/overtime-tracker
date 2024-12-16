<script lang="ts">
  import dayjs from "dayjs";
  import { t } from "#/stores/messages.svelte";
  import { WorkLocation } from "#/types/worklog";
  import Modal from "#/components/modal.svelte";
  import Button from "#/components/button.svelte";
  import ToggleGroup from "#/components/toggle-group.svelte";
  import DateTimeInput from "#/components/date-time-input.svelte";
  import { createInProgressWork } from "#/stores/worklogs.svelte";
  import { toastError } from "#/stores/toasts.svelte";

  let { open = $bindable() } = $props();

  let startTime = $state(new Date()),
    location = $state(WorkLocation.HOME),
    description = $state("");
  let isStartingWork = $state(false);

  $effect(() => {
    if (open) {
      startTime = new Date();
      location = WorkLocation.HOME;
      description = "";
    }
  });

  const onStartWork = async () => {
    isStartingWork = true;
    try {
      await createInProgressWork({
        startTime: dayjs(startTime).startOf("minute").toDate(),
        location,
        description: description || undefined,
      });
      open = false;
    } catch (error) {
      console.error(error);
      toastError(error);
    } finally {
      isStartingWork = false;
    }
  };
</script>

<Modal bind:open>
  {#snippet heading()}{t("start_work")}{/snippet}
  <div class="flex flex-col gap-4">
    <div>
      <div class="text-sm font-medium">{t("start_time")}</div>
      <ToggleGroup
        bind:value={() =>
          dayjs().startOf("minute").diff(dayjs(startTime).startOf("minute"), "minutes").toString(),
        (v) => (startTime = dayjs().startOf("minute").subtract(parseInt(v), "minutes").toDate())}
        options={[
          { value: "0", label: t("now") },
          { value: "5", label: t("minutes_ago", { count: 5 }) },
          { value: "15", label: t("minutes_ago", { count: 15 }) },
        ]}
      />
      <DateTimeInput id="startTime" class="mt-2" bind:value={startTime} />
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
        class="rounded-lg border border-slate-300 p-2 w-full"
        placeholder={t("description_placeholder")}
      ></textarea>
    </div>
    <div class="flex justify-end gap-4">
      <Button onclick={onStartWork} loading={isStartingWork}>{t("start_work")}</Button>
    </div>
  </div>
</Modal>
