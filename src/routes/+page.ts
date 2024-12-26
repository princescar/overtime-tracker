import type { PageLoad } from "./$types";
import { worklogStore } from "#/stores/worklog.svelte";
import { balanceStore } from "#/stores/balance.svelte";

export const load: PageLoad = ({ data }) => {
  const { worklogs, balance } = data;
  const { completed, inProgress } = worklogs;
  worklogStore.init(completed.data, completed.total, inProgress);
  balanceStore.init(balance);
};
