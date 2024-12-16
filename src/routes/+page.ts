import type { PageLoad } from "./$types";
import { initWorklogsStore } from "#/stores/worklogs.svelte";
import { initBalanceStore } from "#/stores/balance.svelte";

export const load: PageLoad = ({ data }) => {
  const { worklogs, balance } = data;
  initWorklogsStore(worklogs);

  initBalanceStore(balance);
};
