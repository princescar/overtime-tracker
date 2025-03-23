<script lang="ts">
  import { t } from "#/stores/i18n.svelte";
  import { WorkLocation } from "#/types/worklog";

  interface WorkSummaryProps {
    location: WorkLocation;
    date: Date;
  }

  const { location, date }: WorkSummaryProps = $props();
  const keys = {
    [WorkLocation.HOME]: "work_at_home",
    [WorkLocation.OFFICE]: "work_in_office",
    [WorkLocation.BUSINESS_TRIP]: "business_trip",
  };
</script>

{t("work_location_on_day", { location: t(keys[location]), date })}
