<script lang="ts">
  import dayjs from "dayjs";
  import clsx from "clsx";
  import { EditOutline } from "flowbite-svelte-icons";
  import { t } from "#/stores/i18n.svelte";
  import { WorkLocation, type IWorklog } from "#/types/worklog";
  import { worklogStore } from "#/stores/worklog.svelte";
  import { balanceStore } from "#/stores/balance.svelte";
  import { toastStore } from "#/stores/toast.svelte";
  import CompleteWorkModal from "./complete-work-modal.svelte";
  import LogCompletedWorkModal from "./log-completed-work-modal.svelte";
  import WorkSummary from "#/components/work-summary.svelte";
  import TimeRange from "#/components/time-range.svelte";
  import MultiLineText from "#/components/multi-line-text.svelte";
  import Button from "#/components/button.svelte";
  import DateTimeInput from "#/components/date-time-input.svelte";
  import ToggleGroup from "#/components/toggle-group.svelte";
  import ConfirmDialog from "#/components/confirm-dialog.svelte";

  // States
  let loading = $state(false),
    isStartingNewWork = $state(false),
    isCancelingWork = $state(false),
    isEditingLocation = $state(false),
    isEditingDescription = $state(false),
    isEditingStartTime = $state(false),
    isCompleteWorkModalOpen = $state(false),
    isLogCompletedWorkModalOpen = $state(false),
    deletingWorklogId = $state<string>();

  // Refs
  let confirmDialog = $state<ConfirmDialog>();
  let descriptionTextArea = $state<HTMLTextAreaElement>();
  let startTimeInput = $state<DateTimeInput>();

  // Computation helpers
  const calculateTotalMinutes = (...timeRanges: { startTime: Date; endTime?: Date }[]) =>
    timeRanges.reduce((acc, { startTime, endTime }) => {
      if (!endTime) return acc;
      const normalizedStartTime = dayjs(startTime).startOf("minute");
      const normalizedEndTime = dayjs(endTime).startOf("minute");
      return acc + normalizedEndTime.diff(normalizedStartTime, "minutes");
    }, 0);

  const durationDisplay = (totalMinutes: number) => {
    let output = "";
    if (totalMinutes < 0) {
      output += "- ";
    }

    totalMinutes = Math.abs(totalMinutes);

    if (totalMinutes < 60) {
      output += t("minutes", { minutes: totalMinutes });
    } else if (totalMinutes % 60 === 0) {
      output += t("hours", { hours: totalMinutes / 60 });
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      output += t("hours_and_minutes", { hours, minutes });
    }

    return output;
  };

  // Actions
  const onStartNewWork = async () => {
    isStartingNewWork = true;
    try {
      await worklogStore.createInProgress({
        startTime: dayjs().startOf("minute").toDate(),
        location: WorkLocation.HOME,
      });
    } catch (error) {
      console.error(error);
      toastStore.error(error);
    } finally {
      isStartingNewWork = false;
    }
  };

  const onCancelWork = async () => {
    try {
      await confirmDialog?.promptConfirm(t("confirm_to_cancel_work"), t("cancel"));
    } catch {
      return;
    }

    isCancelingWork = true;
    try {
      await worklogStore.cancelInProgress();
    } catch (error) {
      console.error(error);
      toastStore.error(error);
    } finally {
      isCancelingWork = false;
    }
  };

  const onChangeLocation = async (newLocation: WorkLocation) => {
    if (!worklogStore.inProgressItem) return;
    const oldLocation = worklogStore.inProgressItem.location;
    worklogStore.inProgressItem.location = newLocation;
    isEditingLocation = false;
    try {
      await worklogStore.modifyInProgress({ location: newLocation });
    } catch (error) {
      console.error(error);
      toastStore.error(error);
      worklogStore.inProgressItem.location = oldLocation;
    }
  };

  const onChangeDescription = async (newDescription: string) => {
    if (!worklogStore.inProgressItem) return;
    const oldDescription = worklogStore.inProgressItem.description;
    newDescription = newDescription.trim();
    worklogStore.inProgressItem.description = newDescription;
    isEditingDescription = false;
    try {
      await worklogStore.modifyInProgress({ description: newDescription || null });
    } catch (error) {
      console.error(error);
      toastStore.error(error);
      worklogStore.inProgressItem.description = oldDescription;
    }
  };

  const onChangeStartTime = async (newStartTime?: Date | null) => {
    if (!worklogStore.inProgressItem || !newStartTime) return;
    const oldStartTime = worklogStore.inProgressItem.startTime;
    worklogStore.inProgressItem.startTime = newStartTime;
    isEditingStartTime = false;
    try {
      await worklogStore.modifyInProgress({ startTime: newStartTime });
    } catch (error) {
      console.error(error);
      toastStore.error(error);
      worklogStore.inProgressItem.startTime = oldStartTime;
    }
  };

  const onDeleteWork = async (id: string) => {
    try {
      await confirmDialog?.promptConfirm(t("confirm_to_delete_work"), t("delete"));
    } catch {
      return;
    }

    deletingWorklogId = id;
    try {
      await worklogStore.deleteCompleted(id);
    } catch (error) {
      console.error(error);
      toastStore.error(error);
    } finally {
      deletingWorklogId = undefined;
    }
  };
</script>

<div class="container mx-auto max-w-[680px] px-4 py-8">
  <h1 class="text-center text-3xl font-bold">
    {t("overtime_tracker")}
  </h1>

  <div class="mt-8 flex flex-col gap-4">
    {@render balanceCard()}

    {#if worklogStore.inProgressItem}
      {@render inProgressWorkCard(worklogStore.inProgressItem)}
    {/if}

    <div class="mt-8 flex flex-col gap-4">
      <h2 class="text-2xl font-bold">{t("recent_worklogs")}</h2>
      {#if Object.entries(worklogStore.completedItemsByWeek).length > 0}
        <div class="flex flex-col gap-4">
          {#each Object.entries(worklogStore.completedItemsByWeek) as [weekKey, worklogsInWeek] (weekKey)}
            {@render weekSectionGroup(new Date(weekKey), worklogsInWeek)}
          {/each}
        </div>
      {:else}
        <div class="flex justify-center">
          <div class="text-gray-500">{t("no_recent_worklogs")}</div>
        </div>
      {/if}

      {#if loading}
        <div class="flex justify-center">
          <div
            class="border-t-primary-600 h-6 w-6 animate-spin rounded-full border-2 border-gray-300"
          ></div>
        </div>
      {:else if worklogStore.hasMoreCompleted}
        <div class="flex justify-center">
          <button
            class="text-primary-500 cursor-pointer"
            onclick={() => worklogStore.loadMoreCompleted()}
          >
            {t("load_more")}
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<CompleteWorkModal bind:open={isCompleteWorkModalOpen} />
<LogCompletedWorkModal bind:open={isLogCompletedWorkModalOpen} />
<ConfirmDialog bind:this={confirmDialog} />

{#snippet balanceCard()}
  <div class="rounded-lg border border-slate-300 p-4 shadow-xs dark:border-slate-700">
    <div class="flex flex-col gap-4">
      <div class="text-lg font-medium">{t("time_remaining")}</div>
      <div
        class={clsx(
          "text-xl font-bold",
          balanceStore.shouldWarn ? "text-red-700" : "text-green-700",
        )}
      >
        {durationDisplay(balanceStore.balance)}
      </div>
      {#if !worklogStore.inProgressItem}
        <div class="mt-4 flex gap-4">
          <Button onclick={onStartNewWork} loading={isStartingNewWork}>{t("start_new_work")}</Button
          >
          <Button variant="light" onclick={() => (isLogCompletedWorkModalOpen = true)}>
            {t("log_completed_work")}
          </Button>
        </div>
      {/if}
    </div>
  </div>
{/snippet}

{#snippet inProgressWorkCard({ location, startTime, description }: IWorklog)}
  <div
    class="border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-950 rounded-lg border p-4 shadow-xs"
  >
    <div class="flex h-full flex-col gap-3">
      <div class="flex items-start justify-between">
        {#if isEditingLocation}
          <ToggleGroup
            class="my-2"
            value={location}
            options={[
              { value: WorkLocation.HOME, label: t("home") },
              { value: WorkLocation.OFFICE, label: t("office") },
              { value: WorkLocation.BUSINESS_TRIP, label: t("business_trip") },
            ]}
            onValueChange={(newValue) => onChangeLocation(newValue as WorkLocation)}
          />
        {:else}
          <button
            class="group text-primary-800 hover:text-primary-900 flex items-center gap-2 text-lg font-medium"
            onclick={() => (isEditingLocation = true)}
            title={t("click_to_edit")}
          >
            <WorkSummary {location} date={startTime} />
            <EditOutline class="hidden group-hover:block" />
          </button>
        {/if}
        <span
          class="bg-primary-100 text-primary-500 dark:bg-primary-900 dark:text-primary-300 rounded-full px-2 py-1 text-xs font-medium uppercase"
        >
          {t("in_progress")}
        </span>
      </div>
      {#if isEditingDescription}
        <div class="flex flex-col gap-2">
          <!-- svelte-ignore a11y_autofocus -->
          <textarea
            class="rounded-lg p-2 text-sm"
            bind:this={descriptionTextArea}
            value={description}
            autofocus
          ></textarea>
          <div class="flex gap-2 self-start">
            <Button
              compact
              onclick={() => descriptionTextArea && onChangeDescription(descriptionTextArea.value)}
            >
              {t("save")}
            </Button>
            <Button variant="subtle" compact onclick={() => (isEditingDescription = false)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      {:else}
        <button
          class="group flex items-center gap-1 self-start text-left text-sm hover:text-gray-600"
          class:text-gray-500={!!description}
          class:text-gray-400={!description}
          onclick={() => (isEditingDescription = true)}
          title={t("click_to_edit")}
        >
          {#if description == null || description.length === 0}
            {t("description_placeholder")}
          {:else}
            <MultiLineText text={description} />
          {/if}
          <EditOutline class="hidden group-hover:block" />
        </button>
      {/if}
      {#if isEditingStartTime}
        <div class="flex flex-col items-center gap-2">
          <DateTimeInput bind:this={startTimeInput} value={startTime} autofocus />
          <div class="flex gap-2 self-start">
            <Button
              compact
              onclick={() => startTimeInput && onChangeStartTime(startTimeInput.getValue())}
            >
              {t("save")}
            </Button>
            <Button variant="subtle" compact onclick={() => (isEditingStartTime = false)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      {:else}
        <button
          class="group flex items-center gap-1 self-start text-sm text-gray-500 hover:text-gray-600"
          onclick={() => (isEditingStartTime = true)}
          title={t("click_to_edit")}
        >
          <TimeRange {startTime} />
          <EditOutline class="hidden group-hover:block" />
        </button>
      {/if}
      <div class="mt-5 flex gap-4">
        <Button
          onclick={() => (isCompleteWorkModalOpen = true)}
          disabled={isEditingLocation || isEditingDescription || isEditingStartTime}
          >{t("mark_as_complete")}</Button
        >
        <Button
          variant="danger"
          onclick={onCancelWork}
          disabled={isEditingLocation || isEditingDescription || isEditingStartTime}
          loading={isCancelingWork}
        >
          {t("cancel")}
        </Button>
      </div>
      <div class="text-xs text-gray-400">{t("click_any_property_to_edit")}</div>
    </div>
  </div>
{/snippet}

{#snippet completedWorkCard({ id, location, startTime, endTime, description }: IWorklog)}
  <div
    class="rounded-lg border border-gray-300 p-4 shadow-xs transition-opacity hover:border-gray-400 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
    class:opacity-50={deletingWorklogId === id}
    class:pointer-events-none={deletingWorklogId === id}
  >
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <span class="text-lg">
          <WorkSummary {location} date={startTime} />
        </span>
        <div class="group">
          {#if endTime}
            <span class="text-gray-500 group-hover:hidden">
              {durationDisplay(calculateTotalMinutes({ startTime, endTime }))}
            </span>
            <Button
              variant="danger"
              compact
              class="hidden group-hover:block"
              onclick={() => onDeleteWork(id)}
            >
              {t("delete")}
            </Button>
          {/if}
        </div>
      </div>
      {#if description}
        <span class="text-sm text-gray-500">
          <MultiLineText text={description} />
        </span>
      {/if}
      <span class="text-sm text-gray-500">
        <TimeRange {startTime} {endTime} />
      </span>
    </div>
  </div>
{/snippet}

{#snippet weekSectionGroup(weekStartDate: Date, worklogs?: IWorklog[])}
  {#if worklogs && worklogs.length > 0}
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-500">
          {t("week_of", { date: weekStartDate })}
        </span>
        <span class="text-sm text-gray-500">
          {t("duration_in_total", {
            duration: durationDisplay(calculateTotalMinutes(...worklogs)),
          })}
        </span>
      </div>
      <div class="flex flex-col gap-4">
        {#each worklogs as worklog (worklog.id)}
          {@render completedWorkCard(worklog)}
        {/each}
      </div>
    </div>
  {/if}
{/snippet}
