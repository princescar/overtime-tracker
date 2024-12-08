import type { PageContext } from "vike/types";
import { BalanceService, WorklogService } from "#/services";
import { IWorklog, WorklogStatus } from "#/types";

export interface PageData {
  worklogs: IWorklog[];
  inProgressWork?: IWorklog;
  balance: number;
  itemsPerPage: number;
}

const ITEMS_PER_PAGE = 20;

export async function data(pageContext: PageContext): Promise<PageData> {
  const { user } = pageContext;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const balanceService = new BalanceService();
  const balance = await balanceService.getBalance(user.id);

  const worklogService = new WorklogService();
  const worklogs = await worklogService.queryWorklogs({
    userId: user.id,
    status: WorklogStatus.COMPLETED,
    page: 1,
    limit: ITEMS_PER_PAGE,
  });
  const inProgressWork = (
    await worklogService.queryWorklogs({
      userId: user.id,
      status: WorklogStatus.IN_PROGRESS,
    })
  )[0];

  return {
    worklogs,
    inProgressWork,
    balance,
    itemsPerPage: ITEMS_PER_PAGE,
  };
}
