<script lang="ts">
  import dayjs from "dayjs";
  import clsx from "clsx";
  import { t } from "#/stores/messages.svelte";
  import { WorkLocation, type IWorklog } from "#/types/worklog";
  import Button from "#/components/button.svelte";
  import {
    worklogsStore,
    loadMoreCompletedWorks,
    createInProgressWork,
    cancelInProgressWork,
    modifyInProgressWork,
    deleteCompletedWork,
  } from "#/stores/worklogs.svelte";
  import { balanceStore } from "#/stores/balance.svelte";
  import { toastError } from "#/stores/toasts.svelte";
  import CompleteWorkModal from "./complete-work-modal.svelte";
  import CreateCompletedWorkModal from "./create-completed-work-modal.svelte";
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
    isCreateCompletedWorkModalOpen = $state(false),
    deletingWorklogId = $state<string>();

  // Refs
  let confirmDialog: ConfirmDialog;
  let descriptionInput: HTMLInputElement;
  let startTimeInput: DateTimeInput;

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
      await createInProgressWork({
        startTime: dayjs().startOf("minute").toDate(),
        location: WorkLocation.HOME,
      });
    } catch (error) {
      console.error(error);
      toastError(error);
    } finally {
      isStartingNewWork = false;
    }
  };

  const onCancelWork = async (id: string) => {
    try {
      await confirmDialog.promptConfirm(t("confirm_to_cancel_work"), t("cancel"));
    } catch {
      return;
    }

    isCancelingWork = true;
    try {
      await cancelInProgressWork(id);
    } catch (error) {
      console.error(error);
      toastError(error);
    } finally {
      isCancelingWork = false;
    }
  };

  const onChangeLocation = async (newLocation: WorkLocation) => {
    if (!worklogsStore.inProgressWork) return;
    const oldLocation = worklogsStore.inProgressWork.location;
    worklogsStore.inProgressWork.location = newLocation;
    isEditingLocation = false;
    try {
      await modifyInProgressWork(worklogsStore.inProgressWork.id, { location: newLocation });
    } catch (error) {
      console.error(error);
      toastError(error);
      worklogsStore.inProgressWork.location = oldLocation;
    }
  };

  const onChangeDescription = async (newDescription: string) => {
    if (!worklogsStore.inProgressWork) return;
    const oldDescription = worklogsStore.inProgressWork.description;
    newDescription = newDescription.trim();
    worklogsStore.inProgressWork.description = newDescription;
    isEditingDescription = false;
    try {
      await modifyInProgressWork(worklogsStore.inProgressWork.id, {
        description: newDescription || null, // Set to null to clear the value if it's blank
      });
    } catch (error) {
      console.error(error);
      toastError(error);
      worklogsStore.inProgressWork.description = oldDescription;
    }
  };

  const onChangeStartTime = async (newStartTime?: Date | null) => {
    if (!worklogsStore.inProgressWork || !newStartTime) return;
    const oldStartTime = worklogsStore.inProgressWork.startTime;
    worklogsStore.inProgressWork.startTime = newStartTime;
    isEditingStartTime = false;
    try {
      await modifyInProgressWork(worklogsStore.inProgressWork.id, { startTime: newStartTime });
    } catch (error) {
      console.error(error);
      toastError(error);
      worklogsStore.inProgressWork.startTime = oldStartTime;
    }
  };

  const onDeleteWork = async (id: string) => {
    try {
      await confirmDialog.promptConfirm(t("confirm_to_delete_work"), t("delete"));
    } catch {
      return;
    }

    deletingWorklogId = id;
    try {
      await deleteCompletedWork(id);
    } catch (error) {
      console.error(error);
      toastError(error);
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

    {#if worklogsStore.inProgressWork}
      {@render inProgressWorkCard(worklogsStore.inProgressWork)}
    {/if}

    <div class="mt-8 flex flex-col gap-4">
      <h2 class="text-2xl font-bold">{t("recent_worklogs")}</h2>
      <div class="flex flex-col gap-4">
        {#each Object.entries(worklogsStore.completedWorksByWeek) as [weekKey, worklogsInWeek] (weekKey)}
          {@render weekSectionGroup(new Date(weekKey), worklogsInWeek)}
        {/each}
      </div>

      {#if loading}
        <div class="flex justify-center">
          <div
            class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
          ></div>
        </div>
      {:else if worklogsStore.hasMoreCompletedWorks}
        <div class="flex justify-center">
          <button class="cursor-pointer text-blue-500" onclick={loadMoreCompletedWorks}>
            {t("load_more")}
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<CompleteWorkModal
  bind:open={isCompleteWorkModalOpen}
  inProgressWork={worklogsStore.inProgressWork}
/>
<CreateCompletedWorkModal bind:open={isCreateCompletedWorkModalOpen} />

<ConfirmDialog bind:this={confirmDialog} />

{#snippet workSummary(location: WorkLocation, date: Date)}
  {@const keys = {
    [WorkLocation.HOME]: "work_at_home",
    [WorkLocation.OFFICE]: "work_in_office",
    [WorkLocation.BUSINESS_TRIP]: "business_trip",
  }}
  {t("work_location_on_day", { location: t(keys[location]), date })}
{/snippet}

{#snippet timeRange(startTime: Date, endTime?: Date | null)}
  {#if !endTime}
    {t("started_from", { startTime })}
  {:else if dayjs(startTime).isSame(dayjs(endTime), "day")}
    {t("same_day_start_end", { startTime, endTime })}
  {:else}
    {t("different_day_start_end", { startTime, endTime })}
  {/if}
{/snippet}

{#snippet balanceCard()}
  {@const enoughBalance = balanceStore.balance >= 9 * 60}
  <div class="rounded-lg border border-slate-300 p-4 shadow-sm">
    <div class="flex flex-col gap-4">
      <div class="text-lg font-medium">{t("time_remaining")}</div>
      <div class={clsx("text-xl font-bold", enoughBalance ? "text-green-700" : "text-red-700")}>
        {durationDisplay(balanceStore.balance)}
      </div>
      {#if !worklogsStore.inProgressWork}
        <div class="mt-4 flex gap-4">
          <Button onclick={onStartNewWork} loading={isStartingNewWork}>{t("start_new_work")}</Button
          >
          <Button variant="light" onclick={() => (isCreateCompletedWorkModalOpen = true)}>
            {t("log_completed_work")}
          </Button>
        </div>
      {/if}
    </div>
  </div>
{/snippet}

{#snippet editIcon()}
  <svg class="hidden group-hover:block" viewBox="0 0 24 24" width="16" height="16" fill="none">
    <path
      d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}

{#snippet inProgressWorkCard({ id, location, startTime, description }: IWorklog)}
  <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
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
            class="group flex items-center gap-2 text-lg font-medium text-blue-500 transition-colors hover:text-blue-600"
            onclick={() => (isEditingLocation = true)}
            title={t("click_to_edit")}
          >
            {@render workSummary(location, startTime)}
            {@render editIcon()}
          </button>
        {/if}
        <span
          class="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium uppercase text-blue-500"
        >
          {t("in_progress")}
        </span>
      </div>
      {#if isEditingDescription}
        <div class="flex flex-col gap-2">
          <input class="p-2 text-sm" bind:this={descriptionInput} value={description} autofocus />
          <div class="flex gap-2 self-start">
            <Button
              variant="default"
              class="text-sm"
              onclick={() => onChangeDescription(descriptionInput.value)}
            >
              {t("save")}
            </Button>
            <Button variant="subtle" class="text-sm" onclick={() => (isEditingDescription = false)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      {:else}
        <button
          class="group flex items-center gap-1 self-start text-sm transition-colors hover:text-gray-600"
          class:text-gray-500={!!description}
          class:text-gray-400={!description}
          onclick={() => (isEditingDescription = true)}
          title={t("click_to_edit")}
        >
          {description || t("description_placeholder")}
          {@render editIcon()}
        </button>
      {/if}
      {#if isEditingStartTime}
        <div class="flex flex-col items-center gap-2">
          <DateTimeInput bind:this={startTimeInput} value={startTime} autofocus />
          <div class="flex gap-2 self-start">
            <Button
              variant="default"
              class="text-sm"
              onclick={() => onChangeStartTime(startTimeInput.getValue())}
            >
              {t("save")}
            </Button>
            <Button variant="subtle" class="text-sm" onclick={() => (isEditingStartTime = false)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      {:else}
        <button
          class="group flex items-center gap-1 self-start text-sm text-gray-500 transition-colors hover:text-gray-600"
          onclick={() => (isEditingStartTime = true)}
          title={t("click_to_edit")}
        >
          {@render timeRange(startTime)}
          {@render editIcon()}
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
          onclick={() => onCancelWork(id)}
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
    class="rounded-lg border border-gray-300 p-4 shadow-sm transition-opacity hover:border-gray-400 hover:bg-gray-100"
    class:opacity-50={deletingWorklogId === id}
    class:pointer-events-none={deletingWorklogId === id}
  >
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <span class="text-lg">
          {@render workSummary(location, startTime)}
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
      <span class="text-sm text-gray-500">{description}</span>
      <span class="text-sm text-gray-500">
        {@render timeRange(startTime, endTime)}
      </span>
    </div>
  </div>
{/snippet}

{#snippet weekSectionGroup(weekStartDate: Date, worklogs: IWorklog[])}
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-gray-500">
        {t("week_of", { date: weekStartDate })}
      </span>
      <span class="text-sm text-gray-500">
        {t("duration_in_total", { duration: durationDisplay(calculateTotalMinutes(...worklogs)) })}
      </span>
    </div>
    <div class="flex flex-col gap-4">
      {#each worklogs as worklog (worklog.id)}
        {@render completedWorkCard(worklog)}
      {/each}
    </div>
  </div>
{/snippet}
