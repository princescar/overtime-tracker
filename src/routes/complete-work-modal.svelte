<script lang="ts">
  import dayjs from "dayjs";
  import { t } from "#/stores/i18n.svelte";
  import Modal from "#/components/modal.svelte";
  import Button from "#/components/button.svelte";
  import ToggleGroup from "#/components/toggle-group.svelte";
  import DateTimeInput from "#/components/date-time-input.svelte";
  import { worklogStore } from "#/stores/worklog.svelte";
  import { toastStore } from "#/stores/toast.svelte";

  interface CompleteWorkModalProps {
    open?: boolean;
  }

  let { open = $bindable() }: CompleteWorkModalProps = $props();

  let endTime = $state(new Date());
  let isCompletingWork = $state(false);

  const minutesAgo = {
    read: () => {
      return String(dayjs().startOf("minute").diff(dayjs(endTime).startOf("minute"), "minutes"));
    },
    write: (value: string) => {
      const newEndTime = dayjs().startOf("minute").subtract(parseInt(value), "minutes").toDate();
      if (+newEndTime !== +endTime) {
        endTime = newEndTime;
      }
    },
  };

  $effect(() => {
    if (open) {
      endTime = new Date();
    }
  });

  const onCompleteWork = async () => {
    isCompletingWork = true;
    try {
      await worklogStore.markInProgressAsComplete(dayjs(endTime).startOf("minute").toDate());
      open = false;
    } catch (error) {
      console.error(error);
      toastStore.error(error);
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
        bind:value={minutesAgo.read, minutesAgo.write}
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
