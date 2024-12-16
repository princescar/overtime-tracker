<script lang="ts">
  import dayjs from "dayjs";
  import { t } from "#/stores/messages.svelte";
  import { WorkLocation, type IWorklog } from "#/types/worklog";
  import Modal from "#/components/modal.svelte";
  import Button from "#/components/button.svelte";
  import ToggleGroup from "#/components/toggle-group.svelte";
  import DateTimeInput from "#/components/date-time-input.svelte";
  import { completeInProgressWork } from "#/stores/worklogs.svelte";
  import { toastError } from "#/stores/toasts.svelte";

  interface CompleteWorkModalProps {
    open?: boolean;
    inProgressWork?: IWorklog;
  }

  let { open = $bindable(), inProgressWork }: CompleteWorkModalProps = $props();

  let endTime = $state(new Date());
  let isCompletingWork = $state(false);

  $effect(() => {
    if (open) {
      endTime = new Date();
    }
  });

  const onCompleteWork = async () => {
    if (!inProgressWork) return;
    isCompletingWork = true;
    try {
      await completeInProgressWork(inProgressWork.id, dayjs(endTime).startOf("minute").toDate());
      open = false;
    } catch (error) {
      console.error(error);
      toastError(error);
    } finally {
      isCompletingWork = false;
    }
  };
</script>

<Modal bind:open>
  {#snippet heading()}{t("mark_complete")}{/snippet}
  <div class="flex flex-col gap-4">
    <div>
    <div class="text-sm font-medium">{t("end_time")}</div>
      <ToggleGroup
        bind:value={() =>
          dayjs().startOf("minute").diff(dayjs(endTime).startOf("minute"), "minutes").toString(),
        (v) => (endTime = dayjs().startOf("minute").subtract(parseInt(v), "minutes").toDate())}
        options={[
          { value: "0", label: t("now") },
          { value: "5", label: t("minutes_ago", { count: 5 }) },
          { value: "15", label: t("minutes_ago", { count: 15 }) },
        ]}
      />
      <DateTimeInput id="endTime" class="mt-2" bind:value={endTime} />
    </div>
    <div class="flex justify-end gap-4">
      <Button onclick={onCompleteWork} loading={isCompletingWork}>{t("complete")}</Button>
    </div>
  </div>
</Modal>
