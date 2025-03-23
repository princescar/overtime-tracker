<script lang="ts">
  import dayjs from "dayjs";
  import { t } from "#/stores/i18n.svelte";

  interface TimeRangeProps {
    startTime: Date;
    endTime?: Date | null;
  }

  const { startTime, endTime }: TimeRangeProps = $props();
</script>

{#if !endTime}
  {t("started_from", { startTime })}
{:else if dayjs(startTime).isSame(dayjs(endTime), "day")}
  {t("same_day_start_end", { startTime, endTime })}
{:else}
  {t("different_day_start_end", { startTime, endTime })}
{/if}
