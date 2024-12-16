import { BalanceService } from "#/services/balance.service";
import { WorklogService } from "#/services/worklog.service";
import { WorklogStatus } from "#/types/worklog";
import type { PageServerLoad } from "./$types";

const balanceService = new BalanceService();
const worklogService = new WorklogService();

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user.id;

  const [balance, inProgressWorks, completedWorks, completedWorksTotal] = await Promise.all([
    balanceService.getBalance(userId),
    worklogService.queryWorklogs({
      userId,
      status: WorklogStatus.IN_PROGRESS,
      limit: 1,
    }),
    worklogService.queryWorklogs({
      userId,
      status: WorklogStatus.COMPLETED,
      limit: 10,
    }),
    worklogService.countWorklogs({ userId, status: WorklogStatus.COMPLETED }),
  ]);

  return {
    balance,
    worklogs: {
      inProgress: inProgressWorks.length > 0 ? inProgressWorks[0] : undefined,
      completed: {
        data: completedWorks,
        total: completedWorksTotal,
      },
    },
  };
};
