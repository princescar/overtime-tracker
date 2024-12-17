import dayjs from "dayjs";
import { z } from "zod";
import { request } from "#/utils/request";
import { WorkLocation, WorklogStatus, type IWorklog } from "#/types/worklog";

let completedWorks = $state<IWorklog[]>([]);
let totalCompletedWorks = $state(0);
let inProgressWork = $state<IWorklog | undefined>();

export const worklogsStore = $state({
  get completedWorks() {
    return completedWorks;
  },
  get totalCompletedWorks() {
    return totalCompletedWorks;
  },
  get inProgressWork() {
    return inProgressWork;
  },
  get completedWorksByWeek() {
    return [...this.completedWorks]
      .sort((a, b) => +b.startTime - +a.startTime)
      .reduce<Record<string, IWorklog[]>>((acc, worklog) => {
        const startTime = new Date(worklog.startTime);
        const weekStart = dayjs(startTime).startOf("week");
        const weekKey = weekStart.toISOString();

        if (typeof acc[weekKey] === "undefined") {
          acc[weekKey] = [];
        }
        acc[weekKey].push(worklog);
        return acc;
      }, {});
  },
  get hasMoreCompletedWorks() {
    return this.completedWorks.length < this.totalCompletedWorks;
  },
});

export const worklogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  location: z.nativeEnum(WorkLocation),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  description: z.string().optional(),
});

export const initWorklogsStore = (data: {
  inProgress?: IWorklog;
  completed: { data: IWorklog[]; total: number };
}) => {
  inProgressWork = data.inProgress;
  completedWorks = data.completed.data.map((worklog) => worklogSchema.parse(worklog));
  totalCompletedWorks = data.completed.total;
};

export const loadMoreCompletedWorks = async () => {
  if (completedWorks.length >= totalCompletedWorks) return;

  const skip = worklogsStore.completedWorks.length;
  const limit = 10;
  const result = await request<{ worklogs: IWorklog[]; total: number }>(
    `/api/worklogs?status=${WorklogStatus.COMPLETED}&skip=${String(skip)}&limit=${String(limit)}`,
    "GET",
  );
  const parsedWorklogs = result.worklogs.map((worklog) => worklogSchema.parse(worklog));
  completedWorks.push(...parsedWorklogs);
  totalCompletedWorks = result.total;
};

export const createInProgressWork = async (worklog: Omit<IWorklog, "id" | "userId">) => {
  const result = await request<IWorklog>("/api/worklogs/in-progress", "POST", worklog);
  const parsed = worklogSchema.parse(result);

  inProgressWork = parsed;
};

export const cancelInProgressWork = async (worklogId: string) => {
  await request(`/api/worklogs/${worklogId}`, "DELETE");
  inProgressWork = undefined;
};

export const completeInProgressWork = async (worklogId: string, endTime: Date) => {
  const result = await request<IWorklog>(`/api/worklogs/${worklogId}/completion`, "POST", {
    endTime,
  });
  const parsedWorklog = worklogSchema.parse(result);

  inProgressWork = undefined;
  completedWorks.unshift(parsedWorklog);
  totalCompletedWorks += 1;
};

export const createCompletedWork = async (worklog: Omit<IWorklog, "id" | "userId">) => {
  const result = await request<IWorklog>(`/api/worklogs/completed`, "POST", worklog);
  const parsedWorklog = worklogSchema.parse(result);

  completedWorks.unshift(parsedWorklog);
  totalCompletedWorks += 1;
};
