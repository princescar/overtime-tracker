export enum BalanceChangeType {
  WORKLOG = "WORKLOG",
  MANUAL = "MANUAL",
  CRON = "CRON",
}

export interface IBalanceHistory {
  id: string;
  userId: string;
  amount: number;
  timestamp: Date;
  worklogId?: string;
  type: BalanceChangeType;
  description: string;
}
