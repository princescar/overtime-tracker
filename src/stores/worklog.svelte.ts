import dayjs from "dayjs";
import { z } from "zod";
import { request } from "#/utils/request";
import { WorkLocation, WorklogStatus, type IWorklog } from "#/types/worklog";
import { balanceStore } from "./balance.svelte";

export const worklogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  location: z.nativeEnum(WorkLocation),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  description: z.string().optional(),
});

class WorklogStore {
  #completedItems = $state<IWorklog[]>([]);
  #totalCompleted = $state(0);
  #inProgressItem = $state<IWorklog | undefined>();

  get completedItemsByWeek() {
    return Object.groupBy(
      this.#completedItems.toSorted((a, b) => +b.startTime - +a.startTime),
      (worklog) => {
        const startTime = new Date(worklog.startTime);
        const weekStart = dayjs(startTime).startOf("week");
        return weekStart.toISOString();
      },
    );
  }

  get hasMoreCompleted() {
    return this.#completedItems.length < this.#totalCompleted;
  }

  get inProgressItem() {
    return this.#inProgressItem;
  }

  init(completedItems: IWorklog[], totalCompleted: number, inProgressItem?: IWorklog) {
    this.#completedItems = completedItems;
    this.#totalCompleted = totalCompleted;
    this.#inProgressItem = inProgressItem;
  }

  async loadMoreCompleted() {
    if (this.#completedItems.length >= this.#totalCompleted) return;

    const skip = this.#completedItems.length;
    const limit = 10;
    const { worklogs, total } = await request<{ worklogs: IWorklog[]; total: number }>(
      `/api/worklogs?status=${WorklogStatus.COMPLETED}&skip=${String(skip)}&limit=${String(limit)}`,
      "GET",
    );
    const parsedWorklogs = worklogs.map((worklog) => worklogSchema.parse(worklog));
    this.#completedItems.push(...parsedWorklogs);
    this.#totalCompleted = total;
  }

  async createInProgress(worklog: Omit<IWorklog, "id" | "userId">) {
    const created = await request<IWorklog>("/api/worklogs/in-progress", "POST", worklog);
    this.#inProgressItem = worklogSchema.parse(created);
  }

  async modifyInProgress(properties: Partial<IWorklog>) {
    if (!this.#inProgressItem) return;
    const updated = await request(`/api/worklogs/${this.#inProgressItem.id}`, "PATCH", properties);
    this.#inProgressItem = worklogSchema.parse(updated);
  }

  async markInProgressAsComplete(endTime: Date) {
    if (!this.#inProgressItem) return;
    const updated = await request<IWorklog>(
      `/api/worklogs/${this.#inProgressItem.id}/completion`,
      "POST",
      { endTime },
    );

    this.#inProgressItem = undefined;
    this.#completedItems.unshift(worklogSchema.parse(updated));
    this.#totalCompleted += 1;

    await balanceStore.refresh();
  }

  async cancelInProgress() {
    if (!this.#inProgressItem) return;
    await request(`/api/worklogs/${this.#inProgressItem.id}`, "DELETE");
    this.#inProgressItem = undefined;
  }

  async createCompleted(worklog: Omit<IWorklog, "id" | "userId">) {
    const created = await request<IWorklog>(`/api/worklogs/completedItems`, "POST", worklog);

    this.#completedItems.unshift(worklogSchema.parse(created));
    this.#totalCompleted += 1;

    await balanceStore.refresh();
  }

  async deleteCompleted(worklogId: string) {
    await request(`/api/worklogs/${worklogId}`, "DELETE");

    const index = this.#completedItems.findIndex((x) => x.id === worklogId);
    if (index > -1) {
      this.#completedItems.splice(index, 1);
      this.#totalCompleted -= 1;
    }

    await balanceStore.refresh();
  }
}

export const worklogStore = new WorklogStore();
