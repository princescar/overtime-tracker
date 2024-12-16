<script lang="ts">
  import dayjs from "dayjs";
  import clsx from "clsx";
  import { t } from "#/stores/messages.svelte";
  import { WorkLocation, type IWorklog } from "#/types/worklog";
  import Button from "#/components/button.svelte";
  import StartWorkModal from "./start-work-modal.svelte";
  import {
    worklogsStore,
    loadMoreCompletedWorks,
    cancelInProgressWork,
  } from "#/stores/worklogs.svelte";
  import { balanceStore } from "#/stores/balance.svelte";
  import CompleteWorkModal from "./complete-work-modal.svelte";
  import CreateCompletedWorkModal from "./create-completed-work-modal.svelte";

  // States
  let loading = $state(false);
  let isStartWorkModalOpen = $state(false),
    isCompleteWorkModalOpen = $state(false),
    isCreateCompletedWorkModalOpen = $state(false);

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
</script>

<div class="container mx-auto max-w-[680px] px-4 py-8">
  <h1 class="text-center text-3xl font-black">
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

<StartWorkModal bind:open={isStartWorkModalOpen} />
<CompleteWorkModal
  bind:open={isCompleteWorkModalOpen}
  inProgressWork={worklogsStore.inProgressWork}
/>
<CreateCompletedWorkModal bind:open={isCreateCompletedWorkModalOpen} />

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
      <div class={clsx("text-xl font-bold", enoughBalance ? "text-green-500" : "text-red-500")}>
        {durationDisplay(balanceStore.balance)}
      </div>
      {#if !worklogsStore.inProgressWork}
        <div class="mt-4 flex gap-4">
          <Button onclick={() => (isStartWorkModalOpen = true)}>{t("start_new_work")}</Button>
          <Button variant="light" onclick={() => (isCreateCompletedWorkModalOpen = true)}>
            {t("log_completed_work")}
          </Button>
        </div>
      {/if}
    </div>
  </div>
{/snippet}

{#snippet inProgressWorkCard({ id, location, startTime, description }: IWorklog)}
  <div class="rounded-lg border border-lime-100 bg-lime-50 p-4 shadow-sm">
    <div class="flex h-full flex-col justify-between gap-2">
      <div class="flex items-center justify-between">
        <span class="text-lg font-medium">
          {@render workSummary(location, startTime)}
        </span>
        <span
          class="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium uppercase text-blue-500"
        >
          {t("in_progress")}
        </span>
      </div>
      <span class="text-sm text-gray-500">
        {description}
      </span>
      <span class="text-sm text-gray-500">
        {@render timeRange(startTime)}
      </span>
      <div class="mt-4 flex gap-4">
        <Button onclick={() => (isCompleteWorkModalOpen = true)}>{t("mark_as_complete")}</Button>
        <Button variant="danger" onclick={() => cancelInProgressWork(id)}>
          {t("cancel")}
        </Button>
      </div>
    </div>
  </div>
{/snippet}

{#snippet completedWorkCard({ location, startTime, endTime, description }: IWorklog)}
  <div class="rounded-lg border border-slate-300 p-4 shadow-sm">
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <span class="text-lg">
          {@render workSummary(location, startTime)}
        </span>
        {#if endTime}
          <span class="text-gray-500">
            {durationDisplay(calculateTotalMinutes({ startTime, endTime }))}
          </span>
        {/if}
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
